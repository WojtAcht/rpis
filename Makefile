.PHONY: all serve clean

all:
	python3 scripts/build.py

serve: all
	@echo "Podgląd: http://localhost:8000"
	python3 -m http.server 8000 -d _site

clean:
	rm -rf build _site
