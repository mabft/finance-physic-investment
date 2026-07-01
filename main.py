import argparse
import datetime
import os
from config import SCHEDULE_TIMES, OUTPUT_DIR
from data_fetcher import DataFetcher
from physics_metrics import batch_analyze
from report_generator import ReportGenerator
from scheduler import AnalysisScheduler


class AnalysisEngine:
    def __init__(self):
        self.fetcher = DataFetcher()
        self.report_generator = ReportGenerator()
        self.last_pre_market_results = None

    def run_pre_market_analysis(self):
        print(f"[{datetime.datetime.now()}] 开始盘前分析...")
        try:
            price_data = self.fetcher.get_price_series_for_analysis()
            if not price_data:
                print("  ❌ 未能获取价格数据")
                return

            print(f"  获取到 {len(price_data)} 个标的的价格数据")
            analysis_results = batch_analyze(price_data)

            global_data = self.fetcher.fetch_global_indices()
            fund_data = self.fetcher.fetch_all_fund_data()

            report, filepath = self.report_generator.generate_pre_market_report(
                analysis_results, global_data
            )

            self.last_pre_market_results = analysis_results

            print(f"  ✅ 盘前分析完成")
            print(f"  📄 报告已保存: {filepath}")
            print(f"  📊 分析标的数量: {len(analysis_results)}")

            return report, filepath

        except Exception as e:
            print(f"  ❌ 盘前分析失败: {e}")
            import traceback
            traceback.print_exc()
            return None, None

    def run_midday_analysis(self):
        print(f"[{datetime.datetime.now()}] 开始午盘分析...")
        try:
            price_data = self.fetcher.get_price_series_for_analysis()
            if not price_data:
                print("  ❌ 未能获取价格数据")
                return

            print(f"  获取到 {len(price_data)} 个标的的价格数据")
            analysis_results = batch_analyze(price_data)

            report, filepath = self.report_generator.generate_midday_report(
                analysis_results, self.last_pre_market_results
            )

            print(f"  ✅ 午盘分析完成")
            print(f"  📄 报告已保存: {filepath}")

            return report, filepath

        except Exception as e:
            print(f"  ❌ 午盘分析失败: {e}")
            import traceback
            traceback.print_exc()
            return None, None

    def run_after_market_analysis(self):
        print(f"[{datetime.datetime.now()}] 开始收盘分析...")
        try:
            price_data = self.fetcher.get_price_series_for_analysis()
            if not price_data:
                print("  ❌ 未能获取价格数据")
                return

            print(f"  获取到 {len(price_data)} 个标的的价格数据")
            analysis_results = batch_analyze(price_data)

            fund_data = self.fetcher.fetch_all_fund_data()

            report, filepath = self.report_generator.generate_after_market_report(
                analysis_results, fund_data
            )

            self.last_pre_market_results = None

            print(f"  ✅ 收盘分析完成")
            print(f"  📄 报告已保存: {filepath}")
            print(f"  📊 分析标的数量: {len(analysis_results)}")

            return report, filepath

        except Exception as e:
            print(f"  ❌ 收盘分析失败: {e}")
            import traceback
            traceback.print_exc()
            return None, None

    def run_dca_weekly_analysis(self):
        print(f"[{datetime.datetime.now()}] 开始定投周报分析...")
        try:
            price_data = self.fetcher.get_price_series_for_analysis()
            if not price_data:
                print("  ❌ 未能获取价格数据")
                return

            analysis_results = batch_analyze(price_data)

            report, filepath = self.report_generator.generate_dca_weekly_report(
                analysis_results
            )

            print(f"  ✅ 定投周报分析完成")
            print(f"  📄 报告已保存: {filepath}")

            return report, filepath

        except Exception as e:
            print(f"  ❌ 定投周报分析失败: {e}")
            import traceback
            traceback.print_exc()
            return None, None


def main():
    parser = argparse.ArgumentParser(description="物理金融定时分析系统")
    parser.add_argument(
        'mode',
        choices=['run', 'schedule'],
        help="运行模式: run-手动执行, schedule-启动定时任务"
    )
    parser.add_argument(
        '--type',
        choices=['pre_market', 'midday', 'after_market', 'dca_weekly'],
        default=None,
        help="分析类型（仅run模式有效）"
    )
    args = parser.parse_args()

    engine = AnalysisEngine()

    if args.mode == 'run':
        if args.type == 'pre_market':
            engine.run_pre_market_analysis()
        elif args.type == 'midday':
            engine.run_midday_analysis()
        elif args.type == 'after_market':
            engine.run_after_market_analysis()
        elif args.type == 'dca_weekly':
            engine.run_dca_weekly_analysis()
        else:
            print("请指定分析类型: --type pre_market|midday|after_market|dca_weekly")

    elif args.mode == 'schedule':
        scheduler = AnalysisScheduler()

        scheduler.add_pre_market_job(
            engine.run_pre_market_analysis,
            time_str=SCHEDULE_TIMES['pre_market']
        )
        scheduler.add_midday_job(
            engine.run_midday_analysis,
            time_str=SCHEDULE_TIMES['midday']
        )
        scheduler.add_after_market_job(
            engine.run_after_market_analysis,
            time_str=SCHEDULE_TIMES['after_market']
        )
        scheduler.add_dca_weekly_job(
            engine.run_dca_weekly_analysis,
            day_of_week='mon',
            time_str='09:00'
        )

        scheduler.start()


if __name__ == "__main__":
    main()