# ============================================================================
#  WarMode — terminal prompt + welcome banner
#
#  HOW TO USE (pick one):
#    1. Paste this entire block into ~/.zshrc, or
#    2. Save it as ~/.warmode.zsh and add to ~/.zshrc:
#         source ~/.warmode.zsh
#
#  Preview without installing:
#    zsh -i -c 'source ./terminal/warmode.zsh; print -P "$PROMPT"'
# ============================================================================

# --- Two-line Kali-style prompt --------------------------------------------
#   ┌──(root💀kali)-[~/current/path]─[HH:MM:SS]
#   └─#
#
#   root / kali ....... bold red
#   path .............. bold blue
#   HH / MM / SS ...... bold cyan / yellow / magenta (all distinct)
#   brackets, colons .. bold white / grey
#
#   NOTE: ANSI escapes can only change weight and colour, not glyph size.
#   Everything is bold for maximum legibility. For physically larger text,
#   raise the font size in your terminal profile
#   (iTerm2 -> Settings -> Profiles -> Text, or Terminal.app likewise).

zmodload zsh/datetime
setopt PROMPT_SUBST

WARMODE_PROMPT='%B%F{white}┌──(%F{red}root💀kali%F{white})-[%F{blue}%~%F{white}]─[%F{cyan}$(strftime %H)%F{244}:%F{yellow}$(strftime %M)%F{244}:%F{magenta}$(strftime %S)%F{white}]%f%b
%B%F{white}└─%F{red}#%f%b '

PROMPT="$WARMODE_PROMPT"

# Powerlevel10k (and some other themes) build their prompt lazily in a precmd
# hook, which silently overwrites a PROMPT set earlier in .zshrc. Re-asserting
# ours in a later precmd hook guarantees this prompt is the one that renders,
# whether or not a theme is active. Harmless when no theme is present.
_warmode_apply_prompt() {
  PROMPT="$WARMODE_PROMPT"
}
autoload -Uz add-zsh-hook
add-zsh-hook precmd _warmode_apply_prompt

# --- Welcome banner ---------------------------------------------------------
# Explicit ANSI escapes (not %F{} prompt escapes) so the banner renders the
# same regardless of terminfo / TERM settings.
warbanner() {
  local b=$'\e[1m' r=$'\e[31m' w=$'\e[37m' c=$'\e[36m' x=$'\e[0m'

  print -r -- ""
  print -r -- "${b}${r}Welcome Intruder${x}"
  print -r -- "${b}${w}Just Stay Fucking Hard MF !!!.${x}"
  print -r -- "${b}${w}I am Just Not You !!!${x}"
  print -r -- "${c}\"I dont Stop when I am tired,${x}"
  print -r -- "${c}I only stop when I am done\"${x}"
  print -r -- ""
}

# Show it on shell start. Guarded so sourcing from a script stays quiet.
if [[ -o interactive ]]; then
  warbanner
fi