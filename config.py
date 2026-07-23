import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

OUTPUT_DIR = os.path.join(BASE_DIR, "output")
CACHE_DIR = os.path.join(BASE_DIR, "cache")

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)

SCHEDULE_TIMES = {
    "pre_market": "09:15",
    "midday": "12:05",
    "after_market": "15:15",
}

INSTRUMENTS = {
    "场内": [
        {"code": "513020", "name": "港股科技ETF国泰", "prefix": "sh", "is_etf": True},
        {"code": "515980", "name": "人工智能ETF", "prefix": "sh", "is_etf": True},
        {"code": "600036", "name": "招商银行", "prefix": "sh", "is_etf": False},
        {"code": "601988", "name": "中国银行", "prefix": "sh", "is_etf": False},
        {"code": "601916", "name": "浙商银行", "prefix": "sh", "is_etf": False},
        {"code": "601333", "name": "广深铁路", "prefix": "sh", "is_etf": False},
        {"code": "002049", "name": "紫光国微", "prefix": "sz", "is_etf": False},
        {"code": "588000", "name": "科创50ETF华夏", "prefix": "sh", "is_etf": True},
        {"code": "515880", "name": "通信ETF国泰", "prefix": "sh", "is_etf": True},
        {"code": "159669", "name": "绿色电力ETF国泰", "prefix": "sz", "is_etf": True},
        {"code": "561560", "name": "电力ETF华泰柏瑞", "prefix": "sh", "is_etf": True},
        {"code": "512400", "name": "有色金属ETF南方", "prefix": "sh", "is_etf": True},
        {"code": "512480", "name": "半导体ETF国联安", "prefix": "sh", "is_etf": True},
        {"code": "159995", "name": "芯片ETF华夏", "prefix": "sz", "is_etf": True},
    ],
    "场外": [
        {"code": "025833", "name": "天弘电网设备C", "is_fund": True},
        {"code": "110003", "name": "易方达上证50增强A", "is_fund": True},
        {"code": "013691", "name": "兴华安恒纯债A", "is_fund": True},
        {"code": "006215", "name": "平安中证500联接C", "is_fund": True},
        {"code": "008887", "name": "华夏半导体芯片A", "is_fund": True},
        {"code": "001593", "name": "天弘创业板联接C", "is_fund": True},
        {"code": "022435", "name": "南方A500联接C", "is_fund": True},
        {"code": "008164", "name": "南方红利低波50C", "is_fund": True},
        {"code": "022930", "name": "易方达A500联接Y", "is_fund": True},
        {"code": "022907", "name": "易方达创业板Y", "is_fund": True},
    ],
    "指数": [
        {"code": "000001", "name": "上证综指", "prefix": "sh", "is_index": True},
        {"code": "000300", "name": "沪深300", "prefix": "sh", "is_index": True},
        {"code": "399006", "name": "创业板指", "prefix": "sz", "is_index": True},
        {"code": "000688", "name": "科创50", "prefix": "sh", "is_index": True},
    ],
    "港股": [
        {"code": "HSI", "name": "恒生指数", "is_hk_index": True},
        {"code": "HSTECH", "name": "恒生科技指数", "is_hk_index": True},
    ],
    "美股": [
        {"code": ".SPX", "name": "标普500", "is_us_index": True},
        {"code": ".IXIC", "name": "纳斯达克", "is_us_index": True},
        {"code": ".DJI", "name": "道琼斯", "is_us_index": True},
    ],
}

PORTFOLIO = {
    "513020": {"cost_price": 1.0480, "quantity": 28500, "is_dca": True},
    "515980": {"cost_price": 1.0000, "quantity": 4200, "is_dca": True},
    "600036": {"cost_price": 37.344, "quantity": 300, "is_dca": False},
    "601988": {"cost_price": 4.3000, "quantity": 900, "is_dca": False},
    "601916": {"cost_price": 3.7663, "quantity": 400, "is_dca": False},
    "601333": {"cost_price": 4.0972, "quantity": 300, "is_dca": False},
    "002049": {"cost_price": 82.0568, "quantity": 200, "is_dca": False},
    "588000": {"cost_price": 2.1600, "quantity": 500, "is_dca": False},
    "025833": {"cost_price": 1.3009, "quantity": 3843, "is_dca": False},
    "110003": {"cost_price": 2.4343, "quantity": 2054, "is_dca": False},
    "013691": {"cost_price": 1.0652, "quantity": 2817, "is_dca": False},
    "006215": {"cost_price": 1.5344, "quantity": 4170, "is_dca": False},
    "008887": {"cost_price": 2.4206, "quantity": 1053, "is_dca": False},
    "001593": {"cost_price": 1.6647, "quantity": 1524, "is_dca": False},
    "022435": {"cost_price": 1.2904, "quantity": 2325, "is_dca": False},
    "008164": {"cost_price": 1.0380, "quantity": 2876, "is_dca": False},
    "022930": {"cost_price": 1.3527, "quantity": 3327, "is_dca": True},
    "022907": {"cost_price": 3.9917, "quantity": 825, "is_dca": True},
    "515880": {"cost_price": 0.825, "quantity": 1000, "is_dca": False},
    "159669": {"cost_price": 1.2, "quantity": 1000, "is_dca": True},
    "561560": {"cost_price": 1.33, "quantity": 1000, "is_dca": False},
    "512400": {"cost_price": 1.78, "quantity": 1000, "is_dca": False},
    "512480": {"cost_price": 1.18, "quantity": 1000, "is_dca": False},
    "159995": {"cost_price": 1.33, "quantity": 1000, "is_dca": False},
}

FEISHU_CONFIG = {
    "app_id": "",
    "app_secret": "",
    "user_id": "ou_ea297088d869586bd72ac4112e199a4c",
    "bitable_app_token": "UeFfbhdqRayRUMs3DCSc0oE9nBj",
}

API_HEADERS = {
    "Sina": {
        "Referer": "https://finance.sina.com.cn",
    },
    "EastMoney": {
        "Referer": "https://quote.eastmoney.com/",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
}

KLINE_DATA_LEN = 260

LOOKBACK_DAYS = 60