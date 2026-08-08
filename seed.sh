#!/bin/bash

# ==============================================================================
# Wexa AI Music Graph Ecosystem - Seeding Script
# ==============================================================================
#
# Generates a self-contained Cypher script (seed/seed.cypher) from the CSV files
# in ./data, ready to paste into the CognoDB Studio. No LOAD CSV, no GitHub URL,
# no cypher-shell needed.
#
# Usage:
#   ./seed.sh                # regenerates seed/seed.cypher
#
# Then:
#   1. Open your CognoDB instance in the console
#   2. Open Studio
#   3. Paste the entire contents of seed/seed.cypher and run it
#
# Idempotent: every statement uses MERGE, so re-running never duplicates data.
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Regenerating seed/seed.cypher from ./data CSVs..."
python3 "$SCRIPT_DIR/generate_seed_cypher.py"

echo ""
echo "========================================"
echo " Done. Next steps:"
echo " 1. Open your CognoDB instance in the console"
echo " 2. Open Studio"
echo " 3. Paste seed/seed.cypher and run it"
echo " 4. Verify: MATCH (n) RETURN count(n)"
echo "========================================"
