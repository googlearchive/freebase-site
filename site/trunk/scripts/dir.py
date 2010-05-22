import os

scripts = os.path.abspath(os.path.dirname(os.path.join(os.getcwd(), __file__)))
trunk = os.path.abspath(os.path.join(scripts, ".."))
deploy = os.path.abspath( os.path.join(trunk, "../deploy"))
dev = os.path.abspath( os.path.join(trunk, "../dev"))
