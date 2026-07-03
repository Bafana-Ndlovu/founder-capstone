# Image credits

The listing photos in `public/images/` are **placeholder demo imagery**, not photos of real
items. They were sourced from **[Wikimedia Commons](https://commons.wikimedia.org)** via its
public search API and are used under the free licences (Creative Commons / public domain) attached
to each file. They are **not** the copyrighted retailer catalogue images they resemble — those
were deliberately avoided so the deployed site is licence-clean.

In a real product, each listing would carry the owner's own photo; this layer only exists so the
demo grid looks populated. The mapping lives in `src/data/demo-images.ts` and never modifies the
provided `src/data/items.ts` fixtures.

## Known source files on Wikimedia Commons

| Item | Image file on Commons |
| --- | --- |
| Extension Ladder | `File:Ladder aluminum.jpg` |
| Folding Tables | `File:Trestle Table MET 85W ACF3138R6.jpg` |
| Lawn Mower | `File:Viking lawn mower.jpg` |
| Wheelbarrow | `File:Wheelbarrows to loan at Waldfriedhof München 01.jpg` |
| PA Speaker | `File:JBL Flip 3 bluetooth speaker (DSCF2653).jpg` |

The remaining images (drill, pressure washer, stand mixer, tile cutter, angle grinder, projector,
socket set, cast-iron pot, hedge trimmer) were retrieved the same way, by search term. Each file's
exact author and licence can be verified on its Commons page (search the term at
commons.wikimedia.org). Before any commercial launch, replace these with owned or properly-licensed
imagery and record per-file attribution here.
