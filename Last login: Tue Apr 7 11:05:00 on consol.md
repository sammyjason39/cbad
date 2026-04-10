Last login: Tue Apr  7 11:05:00 on console
(base) samueljason@Samuels-MacBook-Pro-7 ~ % brew install --cask docker
brew install docker-compose
==> Auto-updating Homebrew...
Adjust how often this is run with `$HOMEBREW_AUTO_UPDATE_SECS` or disable with
`$HOMEBREW_NO_AUTO_UPDATE=1`. Hide these hints with `$HOMEBREW_NO_ENV_HINTS=1` (see `man brew`).
==> Downloading https://ghcr.io/v2/homebrew/core/portable-ruby/blobs/sha256:f41c72b891c40623f9d5cd2135f58a1b8a5c014ae04149888289409316276c72
######################################################################### 100.0%
==> Pouring portable-ruby-4.0.2_1.arm64_big_sur.bottle.tar.gz
==> Auto-updated Homebrew!
Updated 3 taps (steipete/tap, homebrew/core and homebrew/cask).
==> New Formulae
copilot-language-server: Language Server Protocol server for GitHub Copilot
dartaotruntime: Command-line tool for running AOT-compiled snapshots of Dart code
dispenso: High-performance C++ library for parallel programming
expert: Official Elixir Language Server Protocol implementation
git-format-staged: Git command to transform staged files using a formatting command
graalvm: JDK distribution with Graal compiler and Native Image
jsongrep: Query tool for JSON, YAML, TOML, and other structured formats
lazycut: Terminal-based video trimming TUI
libkiwix: Common code base for all Kiwix ports
libpathrs: C-friendly API to make path resolution safer on Linux
merve: C++ lexer for extracting named exports from CommonJS modules
miniaudio: Audio playback and capture library
nextpnr-ice40: Portable FPGA place and route tool for Lattice iCE40
opentimestamps-client: Create and verify OpenTimestamps proofs
pay: HTTP client that automatically handles 402 Payment Required
proxelar: Man-in-the-Middle proxy for HTTP/HTTPS traffic
qtcanvaspainter: Accelerated 2D painting solution for Qt Quick and QRhi-based render targets
qttasktree: General purpose library for asynchronous task execution
rustpython: Python Interpreter written in Rust
rvvm: RISC-V Virtual Machine
sarif-fmt: Pretty print SARIF files to easy human readable output
skip: Tool for building Swift apps for Android
t2sz: Compress a file into a seekable zstd with per-file seeking for tar archives
tini: Tiny but valid init for containers
yelp-xsl: Document transformations from Yelp
==> New Casks
claude-code@latest: Terminal-based AI coding assistant
craft-agents: AI assistant for connecting and working across data sources
font-bj-cree
font-ioskeley-mono
font-saira-stencil
font-strichpunkt-sans
incident-io: Incident management platform
jiba: Apple Music metadata localisation tool
nimbalyst: Visual workspace for building with Codex and Claude Code
notchi: Notch companion for Claude Code
nvidia-sync: Utility for launching applications and containers on remote Linux systems
ob-xf: Virtual analog synthesizer
proton-meet: Desktop client for Proton Meet
radial: Gesture-based launcher for apps, text snippets, and scripts
remanager: Desktop app for managing mods on reMarkable tablets
scribus@devel: Free and open-source page layout program
super: Analytics database that fuses structured and semi-structured data
vibeproxy: Menu bar app for using AI subscriptions with coding tools
voiden@beta: API development tool
wallspace: Live wallpaper app

You have 56 outdated formulae and 2 outdated casks installed.

==> Fetching downloads for: docker-desktop
✔︎ API Source docker-desktop.rb                       Verified      5.1KB/  5.1KB
✔︎ Cask docker-desktop (4.67.0,222858)                Verified    656.6MB/656.6MB
==> Installing Cask docker-desktop
==> Moving App 'Docker.app' to '/Applications/Docker.app'
==> Linking Bash Completion 'docker-compose.bash-completion' to '/opt/homebrew/e
==> Linking Bash Completion 'docker.bash-completion' to '/opt/homebrew/etc/bash_
==> Linking Fish Completion 'docker-compose.fish-completion' to '/opt/homebrew/s
==> Linking Fish Completion 'docker.fish-completion' to '/opt/homebrew/share/fis
==> Linking Zsh Completion 'docker-compose.zsh-completion' to '/opt/homebrew/sha
==> Linking Zsh Completion 'docker.zsh-completion' to '/opt/homebrew/share/zsh/s
==> Linking Binary 'docker-compose' to '/usr/local/cli-plugins/docker-compose'
Password:
==> Unlinking Binary '/usr/local/cli-plugins/docker-compose'
==> Unlinking Zsh Completion '/opt/homebrew/share/zsh/site-functions/_docker'
==> Unlinking Zsh Completion '/opt/homebrew/share/zsh/site-functions/_docker-com
==> Unlinking Fish Completion '/opt/homebrew/share/fish/vendor_completions.d/doc
==> Unlinking Fish Completion '/opt/homebrew/share/fish/vendor_completions.d/doc
==> Unlinking Bash Completion '/opt/homebrew/etc/bash_completion.d/docker'
==> Unlinking Bash Completion '/opt/homebrew/etc/bash_completion.d/docker-compos
==> Backing App 'Docker.app' up to '/opt/homebrew/Caskroom/docker-desktop/4.67.0
==> Removing App '/Applications/Docker.app'
==> Purging files for version 4.67.0,222858 of Cask docker-desktop
Error: It seems there is already a Binary at '/usr/local/bin/hub-tool'.
✔︎ JSON API formula.jws.json                          Downloaded   32.0MB/ 32.0MB
✔︎ JSON API cask.jws.json                             Downloaded   15.4MB/ 15.4MB
==> Fetching downloads for: docker-compose
✔︎ Bottle Manifest docker-compose (5.1.1)             Downloaded    7.5KB/  7.5KB
✔︎ Bottle docker-compose (5.1.1)                      Downloaded    9.5MB/  9.5MB
==> Pouring docker-compose--5.1.1.arm64_tahoe.bottle.tar.gz
==> Caveats
Compose is a Docker plugin. For Docker to find the plugin, add "cliPluginsExtraDirs" to ~/.docker/config.json:
  "cliPluginsExtraDirs": [
      "/opt/homebrew/lib/docker/cli-plugins"
  ]
==> Summary
🍺  /opt/homebrew/Cellar/docker-compose/5.1.1: 8 files, 27.0MB
==> Running `brew cleanup docker-compose`...
Disable this behaviour by setting `HOMEBREW_NO_INSTALL_CLEANUP=1`.
Hide these hints with `HOMEBREW_NO_ENV_HINTS=1` (see `man brew`).
(base) samueljason@Samuels-MacBook-Pro-7 ~ % mkdir ~/.khoj && cd ~/.khoj
wget https://raw.githubusercontent.com/khoj-ai/khoj/master/docker-compose.yml
zsh: command not found: wget
(base) samueljason@Samuels-MacBook-Pro-7 .khoj % wget https://raw.githubusercontent.com/khoj-ai/khoj/master/docker-compose.yml
zsh: command not found: wget
(base) samueljason@Samuels-MacBook-Pro-7 .khoj % brew install wget

==> Fetching downloads for: wget
✔︎ Bottle Manifest wget (1.25.0)                      Downloaded   13.3KB/ 13.3KB
✔︎ Bottle Manifest libunistring (1.4.2)               Downloaded    7.3KB/  7.3KB
✔︎ Bottle Manifest gettext (1.0)                      Downloaded   13.7KB/ 13.7KB
✔︎ Bottle Manifest libidn2 (2.3.8)                    Downloaded   12.8KB/ 12.8KB
✔︎ Bottle libidn2 (2.3.8)                             Downloaded  309.8KB/309.8KB
✔︎ Bottle libunistring (1.4.2)                        Downloaded    1.9MB/  1.9MB
✔︎ Bottle wget (1.25.0)                               Downloaded    1.6MB/  1.6MB
✔︎ Bottle gettext (1.0)                               Downloaded   10.2MB/ 10.2MB
==> Installing dependencies for wget: libunistring, gettext and libidn2
==> Installing wget dependency: libunistring
==> Pouring libunistring--1.4.2.arm64_tahoe.bottle.tar.gz
🍺  /opt/homebrew/Cellar/libunistring/1.4.2: 59 files, 5.8MB
==> Installing wget dependency: gettext
==> Pouring gettext--1.0.arm64_tahoe.bottle.tar.gz
🍺  /opt/homebrew/Cellar/gettext/1.0: 2,499 files, 35.3MB
==> Installing wget dependency: libidn2
==> Pouring libidn2--2.3.8.arm64_tahoe.bottle.tar.gz
🍺  /opt/homebrew/Cellar/libidn2/2.3.8: 80 files, 946.2KB
==> Installing wget
==> Pouring wget--1.25.0.arm64_tahoe.bottle.1.tar.gz
🍺  /opt/homebrew/Cellar/wget/1.25.0: 92 files, 4.7MB
==> Running `brew cleanup wget`...
Disable this behaviour by setting `HOMEBREW_NO_INSTALL_CLEANUP=1`.
Hide these hints with `HOMEBREW_NO_ENV_HINTS=1` (see `man brew`).
(base) samueljason@Samuels-MacBook-Pro-7 .khoj % wget https://raw.githubusercontent.com/khoj-ai/khoj/master/docker-compose.yml
--2026-04-07 12:18:07--  https://raw.githubusercontent.com/khoj-ai/khoj/master/docker-compose.yml
Resolving raw.githubusercontent.com (raw.githubusercontent.com)... 185.199.111.133, 185.199.109.133, 185.199.110.133, ...
Connecting to raw.githubusercontent.com (raw.githubusercontent.com)|185.199.111.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 6260 (6.1K) [text/plain]
Saving to: ‘docker-compose.yml’

docker-compose.yml  100%[===================>]   6.11K  --.-KB/s    in 0s      

2026-04-07 12:18:10 (35.5 MB/s) - ‘docker-compose.yml’ saved [6260/6260]

(base) samueljason@Samuels-MacBook-Pro-7 .khoj % nano docker-compose.yml
(base) samueljason@Samuels-MacBook-Pro-7 .khoj % cd ~/.khoj
(base) samueljason@Samuels-MacBook-Pro-7 .khoj % docker-compose up


yaml: while parsing a block collection at line 65, column 7: line 82, column 8: did not find expected '-' indicator
(base) samueljason@Samuels-MacBook-Pro-7 .khoj % nano docker-compose.yml
(base) samueljason@Samuels-MacBook-Pro-7 .khoj % docker-compose up      


yaml: while scanning for the next token at line 83, column 8: found character that cannot start any token
(base) samueljason@Samuels-MacBook-Pro-7 .khoj % nano docker-compose.yml


  UW PICO 5.09                    File: docker-compose.yml                      

      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 5
  sandbox:
    image: ghcr.io/khoj-ai/terrarium:latest
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 2
  search:
    image: docker.io/searxng/searxng:latest
    volumes:
      - khoj_search:/etc/searxng
    environment:
      - SEARXNG_BASE_URL=http://localhost:8080/
  # Creates Computer for Khoj to use.
  # Set KHOJ_OPERATOR_ENABLED=True in the server service environment variable t$

^G Get Help  ^O WriteOut  ^R Read File ^Y Prev Pg   ^K Cut Text  ^C Cur Pos   
^X Exit      ^J Justify   ^W Where is  ^V Next Pg   ^U UnCut Text^T To Spell  
