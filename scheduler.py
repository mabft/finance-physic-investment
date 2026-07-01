import datetime
import calendar
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.date import DateTrigger


class TradingDayCalendar:
    def __init__(self):
        self.holidays_2026 = {
            "01-01", "01-02", "01-03",
            "02-07", "02-08", "02-09", "02-10", "02-11", "02-12", "02-13",
            "04-04", "04-05", "04-06",
            "05-01", "05-02", "05-03",
            "06-20", "06-21", "06-22",
            "09-19", "09-20", "09-21",
            "10-01", "10-02", "10-03", "10-04", "10-05", "10-06", "10-07",
        }
        self.holidays_2027 = {
            "01-01", "01-02", "01-03",
            "01-28", "01-29", "01-30", "01-31", "02-01", "02-02", "02-03",
            "04-04", "04-05", "04-06",
            "05-01", "05-02", "05-03",
            "06-09", "06-10", "06-11",
            "09-10", "09-11", "09-12",
            "10-01", "10-02", "10-03", "10-04", "10-05", "10-06", "10-07",
        }
        self.holidays = {**self.holidays_2026, **self.holidays_2027}

    def is_trading_day(self, date):
        if date.weekday() >= 5:
            return False
        date_str = date.strftime("%m-%d")
        if date_str in self.holidays:
            return False
        return True

    def get_next_trading_day(self, date=None):
        if date is None:
            date = datetime.date.today()
        next_day = date + datetime.timedelta(days=1)
        while not self.is_trading_day(next_day):
            next_day += datetime.timedelta(days=1)
        return next_day

    def get_trading_days_in_month(self, year, month):
        trading_days = []
        for day in range(1, calendar.monthrange(year, month)[1] + 1):
            date = datetime.date(year, month, day)
            if self.is_trading_day(date):
                trading_days.append(date)
        return trading_days


class AnalysisScheduler:
    def __init__(self, pre_market_func=None, midday_func=None, after_market_func=None):
        self.scheduler = BlockingScheduler(timezone="Asia/Shanghai")
        self.calendar = TradingDayCalendar()
        self.pre_market_func = pre_market_func
        self.midday_func = midday_func
        self.after_market_func = after_market_func

    def _trading_day_filter(self, trigger):
        def wrapper(*args, **kwargs):
            today = datetime.date.today()
            if not self.calendar.is_trading_day(today):
                print(f"今日({today})非交易日，跳过定时任务")
                return
            trigger(*args, **kwargs)
        return wrapper

    def add_pre_market_job(self, func, time_str="09:15"):
        hour, minute = map(int, time_str.split(":"))
        job = self.scheduler.add_job(
            self._trading_day_filter(func),
            CronTrigger(hour=hour, minute=minute, day_of_week="mon-fri"),
            id="pre_market",
            name="盘前分析",
            misfire_grace_time=300,
        )
        return job

    def add_midday_job(self, func, time_str="12:05"):
        hour, minute = map(int, time_str.split(":"))
        job = self.scheduler.add_job(
            self._trading_day_filter(func),
            CronTrigger(hour=hour, minute=minute, day_of_week="mon-fri"),
            id="midday",
            name="午盘分析",
            misfire_grace_time=300,
        )
        return job

    def add_after_market_job(self, func, time_str="15:15"):
        hour, minute = map(int, time_str.split(":"))
        job = self.scheduler.add_job(
            self._trading_day_filter(func),
            CronTrigger(hour=hour, minute=minute, day_of_week="mon-fri"),
            id="after_market",
            name="收盘分析",
            misfire_grace_time=300,
        )
        return job

    def add_dca_weekly_job(self, func, day_of_week="mon", time_str="09:00"):
        hour, minute = map(int, time_str.split(":"))
        job = self.scheduler.add_job(
            self._trading_day_filter(func),
            CronTrigger(day_of_week=day_of_week, hour=hour, minute=minute),
            id="dca_weekly",
            name="定投周报",
            misfire_grace_time=3600,
        )
        return job

    def run_now(self, analysis_type):
        if analysis_type == "pre_market":
            if self.pre_market_func:
                self.pre_market_func()
        elif analysis_type == "midday":
            if self.midday_func:
                self.midday_func()
        elif analysis_type == "after_market":
            if self.after_market_func:
                self.after_market_func()
        else:
            print(f"未知分析类型: {analysis_type}")

    def start(self):
        print("启动定时分析调度器...")
        print("已注册的定时任务:")
        for job in self.scheduler.get_jobs():
            print(f"  - {job.name}: {job.trigger}")
        print("按 Ctrl+C 停止调度器")
        try:
            self.scheduler.start()
        except (KeyboardInterrupt, SystemExit):
            print("\n停止调度器")
            self.scheduler.shutdown()

    def shutdown(self):
        self.scheduler.shutdown()

    def list_jobs(self):
        jobs = self.scheduler.get_jobs()
        print("当前定时任务列表:")
        for job in jobs:
            print(f"  ID: {job.id}")
            print(f"    名称: {job.name}")
            print(f"    触发器: {job.trigger}")
            print(f"    下次执行: {job.next_run_time}")


if __name__ == "__main__":
    def test_task():
        print(f"[{datetime.datetime.now()}] 测试任务执行")

    calendar = TradingDayCalendar()
    today = datetime.date.today()
    print(f"今日({today}): {'交易日' if calendar.is_trading_day(today) else '非交易日'}")
    print(f"下一个交易日: {calendar.get_next_trading_day(today)}")

    scheduler = AnalysisScheduler()
    scheduler.add_pre_market_job(test_task)
    scheduler.add_midday_job(test_task)
    scheduler.add_after_market_job(test_task)
    scheduler.list_jobs()

    print("\n手动测试盘前分析...")
    scheduler.run_now("pre_market")