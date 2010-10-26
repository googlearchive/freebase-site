#!/usr/bin/python
import os, pwd, pdb, re
ROOT_RESOLVER = '/etc/resolver'
ROOT_NAMED = '/var/named'

#ROOT_RESOLVER = '/Users/michael/tmp/dns/resolver'
#ROOT_NAMED = '/Users/michael/tmp/dns/named'

local_domains = ['z', 'devel.freebase.com', 'devel.sandbox-freebase.com', 'devel.branch.qa.metaweb.com', 'devel.trunk.qa.metaweb.com']

if pwd.getpwuid(os.getuid())[0] != 'root':
    print "You must run this script as root."
    exit(-1)

if not os.path.exists(ROOT_RESOLVER):
    os.mkdir(ROOT_RESOLVER)

fh = open("%s/localhost.zone" % ROOT_NAMED) 
zone = fh.readlines()
zone.append("* IN A 127.0.0.1")
fh.close()

def create_zone(domain):
    #pdb.set_trace()
    new_lines = []
    for line in zone:
        new_lines.append(line.replace('localhost', domain))

    return ''.join(new_lines)

named_conf_fh = open('/etc/named.conf', 'r+')
named_conf_lines = named_conf_fh.readlines()


for domain in local_domains:

    fh = open("%s/%s" % (ROOT_RESOLVER, domain), "w")
    fh.write("nameserver 127.0.0.1")
    fh.close()

    fh = open("%s/%s.zone" % (ROOT_NAMED, domain), "w")
    fh.write(create_zone(domain))
    fh.close()

    zone_entry = '''
zone "%s" IN {
    type master;
    file "%s.zone";
    allow-update { none; };
};
''' % (domain, domain)

    if 'zone "%s" IN {\n' % domain not in named_conf_lines:
        named_conf_fh.write(zone_entry)


named_conf_fh.close()

#dns server on mac needs the file /etc/rndc.key to exist
if not os.path.isfile('/etc/rndc.key'):
    os.system('rndc-confgen -a')

#make sure localhost is in the nameserver list
need_localhost_nameserver = True

resolve_fh = open('/etc/resolv.conf', 'r')
lines = resolve_fh.readlines()
first_nameserver_line = 0
resolve_fh.close()

for i,line in enumerate(lines):
    #remember the line after the search statement
    if line.startswith('search '):
        first_nameserver_line = i+1

    #if we find localhost, then we are done
    if re.match("nameserver\s+127.0.0.1", line):
        need_localhost_nameserver = False
        break

#re-open the file and inject the localhost nameserver above the other nameservers
if need_localhost_nameserver:
    lines.insert(first_nameserver_line, 'nameserver 127.0.0.1\n')
    resolve_fh = open('/etc/resolv.conf', 'w')
    resolve_fh.write(''.join(lines))
    resolve_fh.close()


#re-launch the dns server
os.system('launchctl unload /System/Library/LaunchDaemons/org.isc.named.plist')
os.system('launchctl load -w /System/Library/LaunchDaemons/org.isc.named.plist')
os.system('dscacheutil -flushcache')
    



        

