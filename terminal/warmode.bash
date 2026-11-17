# ============================================================================
#  WarMode — terminal prompt + welcome banner  (BASH version)
#
#  HOW TO USE:
#    1. Paste this entire block into ~/.bashrc, or
#    2. Save it as ~/.warmode.bash and add to ~/.bashrc:
#         source ~/.warmode.bash
#
#  Preview without installing:
#    bash -i -c 'source ./terminal/warmode.bash; echo "$PS1"' >/dev/null
#
#  Bash cannot colour parts of \t differently, so PS1 is rebuilt by
#  PROMPT_COMMAND to colour H / M / S individually.
# ============================================================================

# --- Two-line Kali-style prompt --------------------------------------------
#   ┌──(root💀kali)-[~/current/path]─[HH:MM:SS]
#   └─#
#
#   root / kali ....... bold red
#   path .............. bold blue
#   HH / MM / SS ...... bold cyan / yellow / magenta (all distinct)
#   brackets, colons .. bold white / grey

_warmode_build_ps1() {
  local t h m s
  t=$(date +%T)          # HH:MM:SS
  h=${t:0:2}
  m=${t:3:2}
  s=${t:6:2}

  # \[ \] wrap non-printing escapes so bash computes the cursor column right.
  local B='\[\e[1m\]'    # bold on
  local X='\[\e[0m\]'    # reset
  local W='\[\e[37m\]'   # white  - structure
  local R='\[\e[31m\]'   # red    - root / kali / #
  local U='\[\e[34m\]'   # blue   - path
  local C='\[\e[36m\]'   # cyan   - hours
  local Y='\[\e[33m\]'   # yellow - minutes
  local M='\[\e[35m\]'   # magenta- seconds
  local G='\[\e[90m\]'   # grey   - colons

  # \w = cwd with ~ abbreviation; \n = newline
  PS1="${B}${W}┌──(${R}root💀kali${W})-[${U}\w${W}]─[${C}${h}${G}:${Y}${m}${G}:${M}${s}${W}]${X}
${B}${W}└─${R}#${X} "
}

PROMPT_COMMAND=_warmode_build_ps1

# --- Welcome banner ---------------------------------------------------------
_warmode_banner() {
  local b=$'\e[1m' r=$'\e[31m' w=$'\e[37m' c=$'\e[36m' x=$'\e[0m'

  printf '\n'
  printf '%s%sWelcome Intruder%s\n' "$b" "$r" "$x"
  printf '%s%sJust Stay Fucking Hard MF !!!.%s\n' "$b" "$w" "$x"
  printf '%s%sI am Just Not You !!!%s\n' "$b" "$w" "$x"
  printf '%s"I dont Stop when I am tired,%s\n' "$c" "$x"
  printf '%sI only stop when I am done"%s\n' "$c" "$x"
  printf '\n'
}

# Show it on shell start. Guarded so sourcing from a script stays quiet.
case $- in
  *i*) _warmode_banner ;;
esac