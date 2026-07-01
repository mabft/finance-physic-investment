import datetime
import os
from config import OUTPUT_DIR, PORTFOLIO, INSTRUMENTS
from physics_metrics import format_metrics_table, format_state_brief


class ReportGenerator:
    def __init__(self):
        self.output_dir = OUTPUT_DIR

    def _get_today_str(self):
        today = datetime.date.today()
        week_days = ["一", "二", "三", "四", "五", "六", "日"]
        return f"{today.strftime('%Y-%m-%d')} 星期{week_days[today.weekday()]}"

    def generate_pre_market_report(self, analysis_results, global_data):
        today_str = self._get_today_str()
        report = f"# 投资日报 {today_str}\n\n"
        report += "---\n\n"
        report += "## 📊 物理金融状态诊断（盘前）\n\n"

        indices_results = {}
        holdings_results = {}
        hk_results = {}
        us_results = {}

        for name, data in analysis_results.items():
            if any(name in idx['name'] for idx in INSTRUMENTS["指数"]):
                indices_results[name] = data
            elif any(name in inst['name'] for inst in INSTRUMENTS["场内"]):
                holdings_results[name] = data
            elif any(name in hk['name'] for hk in INSTRUMENTS["港股"]):
                hk_results[name] = data
            elif any(name in us['name'] for us in INSTRUMENTS["美股"]):
                us_results[name] = data

        if indices_results:
            report += "### A股指数\n\n"
            report += format_metrics_table(indices_results) + "\n\n"

        if hk_results:
            report += "### 港股市场\n\n"
            report += format_metrics_table(hk_results) + "\n\n"

        if us_results:
            report += "### 隔夜美股\n\n"
            report += format_metrics_table(us_results) + "\n\n"

        if indices_results:
            main_index = next(iter(indices_results.values()))
            report += f"**综合市场状态**: {format_state_brief(main_index['state'])}\n\n"

        report += "## 📋 盘前策略要点\n\n"
        report += "- 温度T > 0.15 时需警惕危机态\n"
        report += "- 熵H > 2.5 时市场混沌，减少操作\n"
        report += "- Hurst > 0.55 趋势持续，可适当加仓\n"
        report += "- Hurst < 0.45 均值回归，关注回调买点\n\n"

        report += "---\n\n"
        report += f"*生成时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n"

        filename = f"pre_market_{datetime.date.today().strftime('%Y%m%d')}.md"
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(report)

        return report, filepath

    def generate_midday_report(self, analysis_results, pre_market_results=None):
        today_str = self._get_today_str()
        report = f"# 午盘分析报告 {today_str}\n\n"
        report += "---\n\n"
        report += "## 📈 盘中指标变化\n\n"

        report += format_metrics_table(analysis_results) + "\n\n"

        if pre_market_results:
            report += "### 盘前 vs 盘中对比\n\n"
            report += "| 标的 | 盘前温度 | 盘中温度 | 变化 |\n"
            report += "|------|---------|---------|------|\n"
            for name, data in analysis_results.items():
                pre_temp = pre_market_results.get(name, {}).get('metrics', {}).get('temperature', 'N/A')
                curr_temp = data['metrics'].get('temperature', 'N/A')
                if pre_temp != 'N/A' and curr_temp != 'N/A':
                    change = curr_temp - pre_temp
                    change_icon = "📈" if change > 0 else "📉" if change < 0 else "➡️"
                    change_str = f"{change_icon} {change:.4f}"
                else:
                    change_str = "N/A"
                report += f"| {name} | {pre_temp} | {curr_temp} | {change_str} |\n"
            report += "\n"

        report += "## ⚠️ 盘中预警\n\n"
        warning_count = 0
        for name, data in analysis_results.items():
            T = data['metrics'].get('temperature')
            H = data['metrics'].get('entropy')
            if T and T > 0.15:
                report += f"- 🔴 {name}: 温度T={T:.4f} > 0.15，危机态预警\n"
                warning_count += 1
            if H and H > 2.5:
                report += f"- 🟡 {name}: 熵H={H:.3f} > 2.5，市场混沌\n"
                warning_count += 1

        if warning_count == 0:
            report += "- ✅ 暂无盘中预警信号\n\n"

        report += "## 🎯 下午操作建议\n\n"
        for name, data in analysis_results.items():
            state = data['state']
            report += f"- {state['state_icon']} **{name}**: {state['strategy']}（仓位上限: {state['max_long_pct']}%）\n"
        report += "\n"

        report += "---\n\n"
        report += f"*生成时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n"

        filename = f"midday_{datetime.date.today().strftime('%Y%m%d')}.md"
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(report)

        return report, filepath

    def generate_after_market_report(self, analysis_results, fund_data):
        today_str = self._get_today_str()
        report = f"# 收盘分析报告 {today_str}\n\n"
        report += "---\n\n"
        report += "## 🔬 全量持仓体检\n\n"

        report += format_metrics_table(analysis_results) + "\n\n"

        report += "## 📝 持仓详细诊断\n\n"
        for name, data in analysis_results.items():
            metrics = data['metrics']
            state = data['state']
            score = data['screen_score']
            pos_mult = data['position_multiplier']

            report += f"### {name}\n\n"
            report += f"| 指标 | 值 | 状态 |\n"
            report += f"|------|-----|------|\n"
            report += f"| 温度T | {metrics['temperature']} | {metrics['temp_icon']} {metrics['temp_zone']} |\n"
            report += f"| 熵H | {metrics['entropy']} bits | {metrics['entropy_icon']} {metrics['entropy_zone']} |\n"
            report += f"| 动量M | {metrics['momentum']} | {metrics['momentum_icon']} {metrics['momentum_zone']} |\n"
            report += f"| Hurst | {metrics['hurst']} | {metrics['hurst_icon']} {metrics['hurst_zone']} |\n"
            report += f"| 评分 | {score}/100 | {'✅ Strong Buy' if score >= 75 else '⚠️ Watchlist' if score >= 60 else '❌ Skip'} |\n"
            report += f"| 仓位系数 | {pos_mult} | |\n"
            report += "\n"
            report += f"**市场状态**: {state['state_icon']} {state['state_name']}\n"
            report += f"**策略**: {state['strategy']}\n"
            report += f"**仓位上限**: {state['max_long_pct']}%\n"
            report += f"**定投操作**: {state['dca_action']}\n\n"

        if fund_data:
            report += "## 💼 场外基金净值\n\n"
            report += "| 代码 | 名称 | 最新净值 | 更新时间 |\n"
            report += "|------|------|---------|----------|\n"
            for code, data in fund_data.items():
                nav = data['nav']
                report += f"| {code} | {data['name']} | {nav['gsz']} | {nav['gsz_time']} |\n"
            report += "\n"

        report += "## 🎯 次日策略建议\n\n"
        for name, data in analysis_results.items():
            state = data['state']
            score = data['screen_score']

            if score >= 75:
                report += f"- 📈 **{name}**: 评分{score}，建议持有或加仓\n"
            elif score >= 60:
                report += f"- ⚠️ **{name}**: 评分{score}，建议观望\n"
            else:
                report += f"- 📉 **{name}**: 评分{score}，建议减仓\n"

            if state['state_name'] == 'CRISIS':
                report += f"  → 🔴 危机态！建议大幅减仓或清仓\n"
            elif state['state_name'] == 'BEAR_TREND':
                report += f"  → 🟠 熊市趋势！建议防御为主\n"
        report += "\n"

        report += "## 📊 定投调整建议\n\n"
        report += "| 标的 | 定投状态 | 调整建议 |\n"
        report += "|------|---------|----------|\n"
        for code, info in PORTFOLIO.items():
            if info['is_dca']:
                found = False
                for name, data in analysis_results.items():
                    inst_info = next((i for i in INSTRUMENTS["场内"] if i['code'] == code), None)
                    if inst_info and inst_info['name'] in name:
                        dca_action = data['state']['dca_action']
                        report += f"| {code} {inst_info['name']} | 定投中 | {dca_action} |\n"
                        found = True
                        break
                if not found:
                    report += f"| {code} | 定投中 | 正常 |\n"
        report += "\n"

        report += "---\n\n"
        report += f"*生成时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n"

        filename = f"after_market_{datetime.date.today().strftime('%Y%m%d')}.md"
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(report)

        return report, filepath

    def generate_dca_weekly_report(self, analysis_results):
        today_str = self._get_today_str()
        report = f"# 定投周报 {today_str}\n\n"
        report += "---\n\n"
        report += "## 📊 定投标的物理状态\n\n"

        dca_results = {}
        for code, info in PORTFOLIO.items():
            if info['is_dca']:
                for name, data in analysis_results.items():
                    inst_info = next((i for i in INSTRUMENTS["场内"] if i['code'] == code), None)
                    if inst_info and inst_info['name'] in name:
                        dca_results[name] = data
                        break

        if dca_results:
            report += format_metrics_table(dca_results) + "\n\n"

        report += "## 💰 定投金额调整\n\n"
        report += "| 标的 | 当前状态 | 定投操作 | 调整幅度 |\n"
        report += "|------|---------|----------|----------|\n"

        for name, data in dca_results.items():
            state = data['state']
            dca_action = state['dca_action']

            if dca_action == 'NORMAL':
                adjust = "正常"
            elif dca_action == 'ACCELERATE_ON_DIP':
                adjust = "回调加码"
            elif dca_action == 'REDUCE_30':
                adjust = "-30%"
            elif dca_action == 'REDUCE_50':
                adjust = "-50%"
            elif dca_action == 'PAUSE':
                adjust = "暂停"
            elif dca_action == 'CAUTIOUS':
                adjust = "谨慎"
            else:
                adjust = "正常"

            report += f"| {name} | {state['state_icon']} {state['state_name']} | {dca_action} | {adjust} |\n"
        report += "\n"

        report += "## ⚠️ 止盈止损提醒\n\n"
        for name, data in dca_results.items():
            T = data['metrics'].get('temperature')
            if T and T > 0.15:
                report += f"- 🔴 {name}: 温度T={T:.4f} > 0.15，建议清仓或大幅减仓\n"
            elif T and T > 0.08:
                report += f"- 🟠 {name}: 温度T={T:.4f} > 0.08，建议减仓\n"

        if not any(data['metrics'].get('temperature') and data['metrics']['temperature'] > 0.08 for data in dca_results.values()):
            report += "- ✅ 暂无止盈止损提醒\n"
        report += "\n"

        report += "---\n\n"
        report += f"*生成时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n"

        filename = f"dca_weekly_{datetime.date.today().strftime('%Y%m%d')}.md"
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(report)

        return report, filepath