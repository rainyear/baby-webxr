import http.server as BaseHTTPServer
import ssl

# IP = "172.172.16.176"
IP = "127.0.0.1"

httpd = BaseHTTPServer.HTTPServer((IP, 8080), BaseHTTPServer.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(
    httpd.socket,
    certfile=f'./{IP}.pem',
    keyfile=f'./{IP}-key.pem',
    server_side=True,
    ssl_version=ssl.PROTOCOL_TLSv1_2)
httpd.serve_forever()