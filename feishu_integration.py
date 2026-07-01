import json
import time
import requests
from config import FEISHU_CONFIG


class FeishuIntegration:
    def __init__(self):
        self.app_id = FEISHU_CONFIG.get("app_id", "")
        self.app_secret = FEISHU_CONFIG.get("app_secret", "")
        self.user_id = FEISHU_CONFIG.get("user_id", "")
        self.bitable_app_token = FEISHU_CONFIG.get("bitable_app_token", "")
        self.base_url = "https://open.feishu.cn/open-apis"
        self.access_token = None
        self.token_expire_time = 0

    def _get_access_token(self):
        now = int(time.time())
        if self.access_token and now < self.token_expire_time:
            return self.access_token

        url = f"{self.base_url}/auth/v3/tenant_access_token/internal"
        data = {
            "app_id": self.app_id,
            "app_secret": self.app_secret
        }
        try:
            resp = requests.post(url, json=data, timeout=10)
            result = resp.json()
            if result.get("code") == 0:
                self.access_token = result["tenant_access_token"]
                self.token_expire_time = now + result["expire"] - 60
                return self.access_token
            else:
                print(f"获取飞书token失败: {result}")
                return None
        except Exception as e:
            print(f"获取飞书token异常: {e}")
            return None

    def _request(self, method, url, **kwargs):
        token = self._get_access_token()
        if not token:
            return None

        headers = kwargs.get("headers", {})
        headers["Authorization"] = f"Bearer {token}"
        headers["Content-Type"] = "application/json; charset=utf-8"
        kwargs["headers"] = headers

        try:
            resp = requests.request(method, url, **kwargs)
            return resp.json()
        except Exception as e:
            print(f"飞书API请求失败: {e}")
            return None

    def create_document(self, title, content):
        url = f"{self.base_url}/docx/v1/documents"
        data = {
            "folder_token": "",
            "title": title,
            "content": content
        }
        result = self._request("POST", url, json=data)
        if result and result.get("code") == 0:
            doc_token = result["data"]["document_id"]
            print(f"创建飞书文档成功: {doc_token}")
            return doc_token
        else:
            print(f"创建飞书文档失败: {result}")
            return None

    def update_document(self, doc_token, content):
        url = f"{self.base_url}/docx/v1/documents/{doc_token}/content"
        data = {
            "requests": [
                {
                    "insert": {
                        "end_position": {
                            "section_id": "",
                            "paragraph_id": ""
                        },
                        "content": content
                    }
                }
            ]
        }
        result = self._request("PATCH", url, json=data)
        if result and result.get("code") == 0:
            print(f"更新飞书文档成功")
            return True
        else:
            print(f"更新飞书文档失败: {result}")
            return False

    def send_message(self, content, chat_id=None):
        if not chat_id:
            chat_id = self.user_id

        url = f"{self.base_url}/im/v1/messages"
        data = {
            "receive_id": chat_id,
            "receive_id_type": "user_id",
            "content": json.dumps({
                "text": content
            }),
            "msg_type": "text"
        }
        result = self._request("POST", url, json=data)
        if result and result.get("code") == 0:
            print("发送飞书消息成功")
            return True
        else:
            print(f"发送飞书消息失败: {result}")
            return False

    def get_bitable_records(self, table_id):
        url = f"{self.base_url}/bitable/v1/apps/{self.bitable_app_token}/tables/{table_id}/records"
        result = self._request("GET", url)
        if result and result.get("code") == 0:
            return result["data"]["items"]
        else:
            print(f"获取Bitable记录失败: {result}")
            return []

    def update_bitable_record(self, table_id, record_id, fields):
        url = f"{self.base_url}/bitable/v1/apps/{self.bitable_app_token}/tables/{table_id}/records/{record_id}"
        data = {
            "fields": fields
        }
        result = self._request("PUT", url, json=data)
        if result and result.get("code") == 0:
            print(f"更新Bitable记录成功: {record_id}")
            return True
        else:
            print(f"更新Bitable记录失败: {result}")
            return False

    def create_bitable_record(self, table_id, fields):
        url = f"{self.base_url}/bitable/v1/apps/{self.bitable_app_token}/tables/{table_id}/records"
        data = {
            "fields": fields
        }
        result = self._request("POST", url, json=data)
        if result and result.get("code") == 0:
            record_id = result["data"]["record_id"]
            print(f"创建Bitable记录成功: {record_id}")
            return record_id
        else:
            print(f"创建Bitable记录失败: {result}")
            return None

    def get_document_url(self, doc_token):
        return f"https://feishu.cn/docx/{doc_token}"

    def has_valid_credentials(self):
        return self.app_id and self.app_secret

    def create_investment_report(self, title, sections):
        content = []

        for section in sections:
            if section["type"] == "heading1":
                content.append({
                    "heading1": {
                        "text": section["content"]
                    }
                })
            elif section["type"] == "heading2":
                content.append({
                    "heading2": {
                        "text": section["content"]
                    }
                })
            elif section["type"] == "heading3":
                content.append({
                    "heading3": {
                        "text": section["content"]
                    }
                })
            elif section["type"] == "paragraph":
                content.append({
                    "paragraph": {
                        "runs": [{
                            "text": section["content"]
                        }]
                    }
                })
            elif section["type"] == "table":
                rows = []
                for row in section["rows"]:
                    cells = []
                    for cell in row:
                        cells.append({
                            "paragraph": {
                                "runs": [{
                                    "text": str(cell)
                                }]
                            }
                        })
                    rows.append({"cells": cells})
                content.append({
                    "table": {
                        "table_rows": rows
                    }
                })

        doc_token = self.create_document(title, {"elements": content})
        if doc_token:
            return self.get_document_url(doc_token)
        return None


if __name__ == "__main__":
    feishu = FeishuIntegration()
    print(f"飞书凭证状态: {'已配置' if feishu.has_valid_credentials() else '未配置'}")

    if feishu.has_valid_credentials():
        print("\n测试飞书集成...")
        token = feishu._get_access_token()
        print(f"Access Token: {token[:20]}..." if token else "获取token失败")

        test_sections = [
            {"type": "heading1", "content": "测试报告"},
            {"type": "paragraph", "content": "这是一个测试报告"},
            {"type": "table", "content": "", "rows": [
                ["标的", "温度", "评分"],
                ["测试1", "0.05", "80"],
                ["测试2", "0.08", "65"]
            ]}
        ]
        url = feishu.create_investment_report("测试投资日报", test_sections)
        print(f"文档URL: {url}")

        feishu.send_message("测试消息")
    else:
        print("请在config.py中配置飞书API凭证")