# DEPENDENCIES
# sudo apt-get install build-essential libssl-dev libffi-dev python-dev
# pip install --user pyOpenSSL

# THIS GENERATES A VALID PEM FILE
# openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes

import BaseHTTPServer, SimpleHTTPServer, ssl, sys, socket, os, time
from OpenSSL import crypto

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.255.255.255', 0))
        IP = s.getsockname()[0]
    except:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

def makeCert(ipAddress):

    key = crypto.PKey()
    key.generate_key(crypto.TYPE_RSA, 2048)

    # create a self-signed cert
    cert = crypto.X509()
    cert.set_version(2)
    cert.set_serial_number( int( time.time()*1000 ) )
    cert.get_subject().C = "UK"
    cert.get_subject().ST = "Wherever"
    cert.get_subject().L = "Londinium"
    cert.get_subject().O = "wevs inc"
    cert.get_subject().OU = "code monkeying"
    cert.get_subject().CN = ipAddress
    cert.gmtime_adj_notBefore(-60*60*24)
    cert.gmtime_adj_notAfter(10*365*24*60*60)
    cert.set_pubkey(key)
    cert.set_issuer(cert.get_subject())
    cert.add_extensions([crypto.X509Extension("subjectKeyIdentifier", False, "hash", subject=cert)])
    cert.add_extensions([crypto.X509Extension("authorityKeyIdentifier", False, "keyid:always",issuer=cert)])
    cert.add_extensions([crypto.X509Extension("basicConstraints", False, "CA:TRUE")])
    cert.sign(key, 'sha256')

    keyAsPEM = crypto.dump_privatekey(crypto.FILETYPE_PEM, key)
    certAsPEM = crypto.dump_certificate(crypto.FILETYPE_PEM, cert)
    certstring = keyAsPEM + certAsPEM
    return certstring

#MAIN

port = 12345
try:
  port = int( sys.argv[1] )
except:
  None

currentIP = get_ip()

PEMFileName = currentIP + ".pem"
with open(PEMFileName, "w") as fileHandle:
    fileHandle.write(makeCert(currentIP))

httpd = BaseHTTPServer.HTTPServer((currentIP, port), SimpleHTTPServer.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket (httpd.socket, certfile=PEMFileName, server_side=True)
print "Serving on:", "https://"+currentIP+":"+str(port)
os.remove(PEMFileName)
httpd.serve_forever()
