import http.server as BaseHTTPServer
import ssl

httpd = BaseHTTPServer.HTTPServer(('127.0.0.1', 8080), BaseHTTPServer.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(httpd.socket, certfile='./127.0.0.1.pem', keyfile='./127.0.0.1-key.pem', server_side=True, ssl_version=ssl.PROTOCOL_TLSv1_2)
httpd.serve_forever()