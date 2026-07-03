import json
import re
import time
import requests
from config import API_HEADERS, KLINE_DATA_LEN, INSTRUMENTS


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

        symbols = []
        code_to_symbol = {}
        for holding in holdings:
            code = holding.get('code', '')
            name = holding.get('name', '')
            if not code:
                continue
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

        for holding in holdings:
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

        return price_series, realtime_data


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