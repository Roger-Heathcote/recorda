import BaseHTTPServer, SimpleHTTPServer
import ssl
import sys

port = 12345
try:
  port = int( sys.argv[1] )
except:
  None

print "using port:", port

httpd = BaseHTTPServer.HTTPServer(('192.168.1.63', port), SimpleHTTPServer.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket (httpd.socket, certfile='server.pem', server_side=True)
httpd.serve_forever()
