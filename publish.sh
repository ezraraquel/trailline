#!/bin/bash
# Publish the Trailline website (home, support, privacy policy) to GitHub Pages.
# Creates the PUBLIC repo ezraraquel/trailline containing only this site/ folder — not the app code.
set -euo pipefail
cd "$(dirname "$0")"
export PATH="/opt/homebrew/bin:$HOME/.local/bin:$PATH"

if [ ! -d .git ]; then
  git init -q -b main
  git add index.html support.html privacy.html mark.svg
  git -c user.name="ezraraquel" -c user.email="ezraraquel@users.noreply.github.com" \
    commit -qm "Trailline website: home, support and privacy policy"
fi

gh repo create ezraraquel/trailline --public \
  --description "Trailline: ski & snowboard tracking. Website, support and privacy policy." \
  --source . --push

gh api -X POST repos/ezraraquel/trailline/pages -f "source[branch]=main" -f "source[path]=/" >/dev/null

echo
echo "Published. Live in about a minute at:"
echo "  Home:     https://ezraraquel.github.io/trailline/"
echo "  Support:  https://ezraraquel.github.io/trailline/support.html"
echo "  Privacy:  https://ezraraquel.github.io/trailline/privacy.html"
