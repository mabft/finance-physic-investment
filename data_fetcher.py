import json
import re
import time
import requests
from config import API_HEADERS, KLINE_DATA_LEN, INSTRUMENTS, PORTFOLIO


class DataFetcher:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        })

    def _sina_gbk_decode(self, text):
        try:
            return text.encode('latin1').decode('gbk')
        except:
            return text

    def fetch_sina_realtime(self, symbols):
        url = f"https://hq.sinajs.cn/list={','.join(symbols)}"
        headers = API_HEADERS["Sina"].copy()
        try:
            resp = self.session.get(url, headers=headers, timeout=10)
            resp.encoding = 'gbk'
            data = {}
            for line in resp.text.strip().split('\n'):
                match = re.match(r'var hq_str_(\w+)="([^"]+)"', line)
                if match:
                    symbol = match.group(1)
                    fields = match.group(2).split(',')
                    data[symbol] = {
                        "name": fields[0],
                        "open": float(fields[1]) if fields[1] else None,
                        "prev_close": float(fields[2]) if fields[2] else None,
                        "current": float(fields[3]) if fields[3] else None,
                        "high": float(fields[4]) if fields[4] else None,
                        "low": float(fields[5]) if fields[5] else None,
                        "volume": int(fields[8]) if fields[8] else None,
                        "amount": float(fields[9]) if fields[9] else None,
                    }
            return data
        except Exception as e:
            print(f"Error fetching Sina realtime: {e}")
            return {}

    def fetch_sina_kline(self, symbol, datalen=KLINE_DATA_LEN):
        url = (f"https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/"
               f"CN_MarketData.getKLineData?symbol={symbol}&scale=240&ma=no&datalen={datalen}")
        headers = API_HEADERS["Sina"].copy()
        try:
            resp = self.session.get(url, headers=headers, timeout=15)
            data = resp.json()
            prices = []
            for item in data:
                try:
                    prices.append(float(item.get('close', 0)))
                except:
                    pass
            return prices
        except Exception as e:
            print(f"Error fetching Sina K-line for {symbol}: {e}")
            return []

    def fetch_fund_nav(self, fund_code):
        url = f"https://fundgz.1234567.com.cn/js/{fund_code}.js"
        try:
            resp = self.session.get(url, timeout=10)
            match = re.search(r'jsonpgz\((.*)\)', resp.text)
            if match:
                data = json.loads(match.group(1))
                return {
                    "name": data.get("name", ""),
                    "gsz": float(data.get("gsz", 0)),
                    "gsz_time": data.get("gsz_time", ""),
                    "dwjz": float(data.get("dwjz", 0)),
                }
        except Exception as e:
            print(f"Error fetching fund NAV for {fund_code}: {e}")
        return None

    def fetch_fund_nav_history(self, fund_code, datalen=KLINE_DATA_LEN):
        """
        获取场外基金历史净值（天天基金 API）
        返回净值价格序列，用于计算物理金融指标
        """
        headers = {
            "Referer": f"https://fundf10.eastmoney.com/jjjz_{fund_code}.html",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "*/*",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        }
        all_prices = []
        page_size = 50  # API 限制每页最多 50 条
        page_index = 1

        try:
            while len(all_prices) < datalen:
                url = (f"https://api.fund.eastmoney.com/f10/lsjz?"
                       f"fundCode={fund_code}&pageIndex={page_index}&pageSize={page_size}&startDate=&endDate=&callback=jQuery")
                resp = self.session.get(url, headers=headers, timeout=15)
                match = re.match(r'jQuery\((.*)\)', resp.text, re.DOTALL)
                if not match:
                    break
                data = json.loads(match.group(1))
                if not isinstance(data.get("Data"), dict):
                    break
                items = data.get("Data", {}).get("LSJZList", [])
                if not items:
                    break
                for item in items:
                    nav = item.get("DWJZ", "")
                    if nav:
                        try:
                            all_prices.append(float(nav))
                        except:
                            pass
                total_count = data.get("TotalCount", 0)
                if len(all_prices) >= total_count or len(all_prices) >= datalen:
                    break
                page_index += 1
                time.sleep(0.3)

            all_prices.reverse()
            return all_prices[:datalen]
        except Exception as e:
            print(f"Error fetching fund NAV history for {fund_code}: {e}")
            return []

    def fetch_cnbc_quotes(self, symbols):
        url = (f"https://quote.cnbc.com/quote-json-webservice/restQuote/quoteData/quoteData.asp?"
               f"symbols={'%7C'.join(symbols)}&requestMethod=quick&noform=1&partnerId=2&output=json")
        try:
            resp = self.session.get(url, timeout=10)
            data = resp.json()
            quotes = {}
            for item in data.get('quickQuoteResult', {}).get('quickQuote', []):
                symbol = item.get('symbol', '')
                quotes[symbol] = {
                    "name": item.get('name', ''),
                    "last": float(item.get('last', 0)),
                    "change_pct": float(item.get('change_pct', 0)),
                    "high52Week": float(item.get('fundamentalData', {}).get('high52Week', 0)),
                    "low52Week": float(item.get('fundamentalData', {}).get('low52Week', 0)),
                }
            return quotes
        except Exception as e:
            print(f"Error fetching CNBC quotes: {e}")
            return {}

    def fetch_eastmoney_hk_index(self, secid):
        url = f"https://push2his.eastmoney.com/api/qt/stock/kline/get?secid={secid}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58&klt=101&fqt=1&end=20500101&limit={KLINE_DATA_LEN}"
        headers = API_HEADERS["EastMoney"].copy()
        try:
            resp = self.session.get(url, headers=headers, timeout=15)
            data = resp.json()
            prices = []
            if data.get('data', {}).get('klines'):
                for line in data['data']['klines']:
                    parts = line.split(',')
                    if len(parts) >= 5:
                        prices.append(float(parts[4]))
            return prices
        except Exception as e:
            print(f"Error fetching EastMoney HK index {secid}: {e}")
            return []

    def fetch_all_ashare_data(self):
        all_data = {}

        sina_symbols = []
        for inst in INSTRUMENTS["场内"]:
            sina_symbols.append(f"{inst['prefix']}{inst['code']}")
        for inst in INSTRUMENTS["指数"]:
            sina_symbols.append(f"{inst['prefix']}{inst['code']}")

        realtime_data = self.fetch_sina_realtime(sina_symbols)
        time.sleep(1)

        for inst in INSTRUMENTS["场内"]:
            symbol = f"{inst['prefix']}{inst['code']}"
            prices = self.fetch_sina_kline(symbol)
            if prices:
                all_data[inst['code']] = {
                    "name": inst['name'],
                    "prices": prices,
                    "realtime": realtime_data.get(symbol, {}),
                    "type": "场内",
                }
            time.sleep(0.3)

        for inst in INSTRUMENTS["指数"]:
            symbol = f"{inst['prefix']}{inst['code']}"
            prices = self.fetch_sina_kline(symbol)
            if prices:
                all_data[f"idx_{inst['code']}"] = {
                    "name": inst['name'],
                    "prices": prices,
                    "realtime": realtime_data.get(symbol, {}),
                    "type": "指数",
                }
            time.sleep(0.3)

        return all_data

    def fetch_all_fund_data(self):
        fund_data = {}
        for inst in INSTRUMENTS["场外"]:
            nav_data = self.fetch_fund_nav(inst['code'])
            if nav_data:
                fund_data[inst['code']] = {
                    "name": inst['name'],
                    "nav": nav_data,
                    "type": "场外",
                }
            time.sleep(0.5)
        return fund_data

    def fetch_global_indices(self):
        global_data = {}

        us_symbols = [inst['code'] for inst in INSTRUMENTS["美股"]]
        us_data = self.fetch_cnbc_quotes(us_symbols)
        for inst in INSTRUMENTS["美股"]:
            if inst['code'] in us_data:
                global_data[f"us_{inst['code']}"] = {
                    "name": inst['name'],
                    "quote": us_data[inst['code']],
                    "type": "美股",
                }

        hsi_prices = self.fetch_eastmoney_hk_index("124.HSI")
        if hsi_prices:
            global_data["hk_HSI"] = {
                "name": "恒生指数",
                "prices": hsi_prices,
                "type": "港股",
            }

        hstech_prices = self.fetch_eastmoney_hk_index("124.HSTECH")
        if hstech_prices:
            global_data["hk_HSTECH"] = {
                "name": "恒生科技指数",
                "prices": hstech_prices,
                "type": "港股",
            }

        return global_data

    def fetch_all_data(self):
        result = {}
        result.update(self.fetch_all_ashare_data())
        result.update(self.fetch_all_fund_data())
        result.update(self.fetch_global_indices())
        return result

    def get_price_series_for_analysis(self):
        all_data = self.fetch_all_data()
        price_series = {}

        for key, data in all_data.items():
            if data['type'] in ["场内", "指数", "港股"]:
                if 'prices' in data and len(data['prices']) >= 30:
                    price_series[data['name']] = data['prices']

        return price_series

    def get_price_series_by_codes(self, holdings):
        price_series = {}
        realtime_data = {}

        # 分离场内股票和场外基金
        stock_holdings = []
        fund_holdings = []
        fund_codes = set()

        # 收集所有场外基金代码
        fund_code_set = set()
        for inst in INSTRUMENTS.get("场外", []):
            fund_code_set.add(inst.get('code', ''))

        for holding in holdings:
            code = holding.get('code', '')
            if not code:
                continue
            # 如果代码在场外基金列表中，归类为场外基金
            if code in fund_code_set:
                fund_holdings.append(holding)
                fund_codes.add(code)
                continue
            stock_holdings.append(holding)

        # 处理场内股票
        symbols = []
        code_to_symbol = {}
        for holding in stock_holdings:
            code = holding.get('code', '')
            if (code.startswith('6') or code.startswith('5')) and len(code) == 6:
                symbol = f"sh{code}"
            elif (code.startswith('0') or code.startswith('3')) and len(code) == 6:
                symbol = f"sz{code}"
            else:
                continue
            symbols.append(symbol)
            code_to_symbol[code] = symbol

        if symbols:
            realtime_data = self.fetch_sina_realtime(symbols)
            time.sleep(0.5)

        for holding in stock_holdings:
            code = holding.get('code', '')
            name = holding.get('name', '')
            if not code:
                continue

            symbol = code_to_symbol.get(code)
            if not symbol:
                continue

            prices = self.fetch_sina_kline(symbol)
            if prices and len(prices) >= 30:
                key = name if name else code
                price_series[key] = prices

                rt = realtime_data.get(symbol, {})
                if rt:
                    current = rt.get('current')
                    prev_close = rt.get('prev_close')
                    change = None
                    change_pct = None
                    if current and prev_close and prev_close > 0:
                        change = round(current - prev_close, 4)
                        change_pct = round(change / prev_close * 100, 2)
                    realtime_data[key] = {
                        "current": current,
                        "prev_close": prev_close,
                        "open": rt.get('open'),
                        "high": rt.get('high'),
                        "low": rt.get('low'),
                        "change": change,
                        "change_pct": change_pct,
                    }

            time.sleep(0.3)

        # 处理场外基金：获取历史净值 + 实时估值
        for holding in fund_holdings:
            code = holding.get('code', '')
            name = holding.get('name', '')
            if not code:
                continue

            # 获取历史净值序列
            prices = self.fetch_fund_nav_history(code)
            if prices and len(prices) >= 30:
                key = name if name else code
                price_series[key] = prices

                # 获取实时估值
                nav_data = self.fetch_fund_nav(code)
                if nav_data:
                    current = nav_data.get('gsz', 0)
                    prev_close = nav_data.get('dwjz', 0)
                    change = None
                    change_pct = None
                    if current and prev_close and prev_close > 0:
                        change = round(current - prev_close, 4)
                        change_pct = round(change / prev_close * 100, 2)
                    realtime_data[key] = {
                        "current": current,
                        "prev_close": prev_close,
                        "open": prev_close,
                        "high": current,
                        "low": current,
                        "change": change,
                        "change_pct": change_pct,
                        "is_fund": True,
                        "nav_time": nav_data.get('gsz_time', ''),
                    }

            time.sleep(0.5)

        return price_series, realtime_data

    def fetch_stock_news(self, code, name, max_count=20):
        """
        获取个股相关新闻（东方财富）
        返回新闻列表，每条包含标题、时间、来源、链接
        """
        # 东方财富个股新闻 API
        # secid: 1.600036 (上海) 或 0.002049 (深圳)
        if code.startswith('6') or code.startswith('5'):
            secid = f"1.{code}"
        elif code.startswith('0') or code.startswith('3'):
            secid = f"0.{code}"
        else:
            return []

        url = (f"https://search-api-web.eastmoney.com/search/jsonp?"
               f"cb=jQuery&param=%7B%22uid%22%3A%22%22%2C%22keyword%22%3A%22{name}%22%2C"
               f"%22type%22%3A%5B%22cmsArticleWebOld%22%5D%2C%22client%22%3A%22web%22%2C"
               f"%22clientType%22%3A%22web%22%2C%22clientVersion%22%3A%22curr%22%2C"
               f"%22param%22%3A%7B%22cmsArticleWebOld%22%3A%7B%22searchScope%22%3A%22default%22%2C"
               f"%22sort%22%3A%22default%22%2C%22pageIndex%22%3A1%2C%22pageSize%22%3A{max_count}%2C"
               f"%22preTag%22%3A%22%22%2C%22postTag%22%3A%22%22%7D%7D%7D")

        headers = API_HEADERS["EastMoney"].copy()
        try:
            resp = self.session.get(url, headers=headers, timeout=10)
            text = resp.text
            # 解析 JSONP
            match = re.match(r'jQuery\((.*)\)', text, re.DOTALL)
            if not match:
                return []
            data = json.loads(match.group(1))

            articles = []
            result = data.get('result', {})
            items = result.get('cmsArticleWebOld', [])
            if isinstance(items, dict):
                items = items.get('list', [])

            for item in items:
                title = item.get('title', '')
                # 清理 HTML 标签
                title = re.sub(r'<[^>]+>', '', title)
                articles.append({
                    "title": title,
                    "date": item.get('date', ''),
                    "media_name": item.get('mediaName', ''),
                    "url": item.get('url', ''),
                    "content": item.get('content', '')[:200] if item.get('content') else '',
                })

            return articles
        except Exception as e:
            print(f"Error fetching news for {name}({code}): {e}")
            return []

    def analyze_news_sentiment(self, news_list):
        """
        基于关键词的新闻情感分析
        返回: 利好/利空/中性 分类 + 重要程度评分
        """
        positive_keywords = [
            "利好", "上涨", "涨停", "突破", "创新高", "业绩增长", "盈利增长",
            "分红", "回购", "增持", "买入", "推荐", "超预期", "景气",
            "政策支持", "降准", "降息", "刺激", "利好消息", "重大合同",
            "战略合作", "并购", "重组", "获批", "通过", "增长", "翻倍",
            "牛市", "放量", "资金流入", "北向资金", "主力买入",
        ]
        negative_keywords = [
            "利空", "下跌", "跌停", "暴跌", "破位", "业绩下滑", "亏损",
            "减持", "抛售", "卖出", "评级下调", "不及预期", "风险",
            "监管", "处罚", "调查", "退市", "爆雷", "违约", "债务",
            "熊市", "缩量", "资金流出", "主力卖出", "清仓", "割肉",
            "贸易战", "制裁", "关税", "加息", "通胀", "衰退",
        ]
        important_keywords = [
            "重大", "重要", "首次", "突破", "创历史新高", "翻倍",
            "政策", "央行", "证监会", "国务院", "美联储",
            "并购", "重组", "退市", "爆雷", "违约",
        ]

        results = []
        for news in news_list:
            title = news.get('title', '')
            content = news.get('content', '')
            text = title + ' ' + content

            pos_count = sum(1 for kw in positive_keywords if kw in text)
            neg_count = sum(1 for kw in negative_keywords if kw in text)
            imp_count = sum(1 for kw in important_keywords if kw in text)

            if pos_count > neg_count:
                sentiment = "positive"
                sentiment_label = "利好"
            elif neg_count > pos_count:
                sentiment = "negative"
                sentiment_label = "利空"
            else:
                sentiment = "neutral"
                sentiment_label = "中性"

            importance = "normal"
            if imp_count >= 2:
                importance = "high"
            elif imp_count >= 1 and max(pos_count, neg_count) >= 1:
                importance = "medium"

            results.append({
                **news,
                "sentiment": sentiment,
                "sentiment_label": sentiment_label,
                "importance": importance,
                "positive_score": pos_count,
                "negative_score": neg_count,
            })

        return results


if __name__ == "__main__":
    fetcher = DataFetcher()
    print("Testing data fetcher...")

    price_data = fetcher.get_price_series_for_analysis()
    print(f"\nFetched {len(price_data)} instruments with price data:")
    for name, prices in price_data.items():
        print(f"  {name}: {len(prices)} data points (latest: {prices[-1] if prices else 'N/A'})")

    fund_data = fetcher.fetch_all_fund_data()
    print(f"\nFetched {len(fund_data)} fund NAVs:")
    for code, data in fund_data.items():
        print(f"  {code} {data['name']}: NAV={data['nav']['gsz']}")

    global_data = fetcher.fetch_global_indices()
    print(f"\nFetched {len(global_data)} global indices:")
    for key, data in global_data.items():
        print(f"  {data['name']}: {data.get('quote', {}).get('last', 'N/A')}")