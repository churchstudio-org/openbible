// Offline fixtures that reflect the structures recorded under `docs/web/`
// (Bíblia Livre, `biblia-livre-*`, and WordProject, `wordproject-*`).
// They let the unit tests run deterministically without hitting the live sites.

const BOOK_PATH = '/site/biblialivre/leia-a-%C3%ADblia';

// One anchor per own chapter group of Gênesis, plus a couple of shared
// navigation entries (Deuteronômio) that must be ignored by `findChapterGroups`.
function bookPage(groups: Array<[number, number]>): string {
    const ownAnchors = groups
        .map(([from, to]) => `<a href="${BOOK_PATH}/g%C3%AAnesis/g%C3%AAnesis-cap%C3%ADtulos-${from}-${to}">${from}-${to}</a>`)
        .join('\n');
    const navAnchors =
        `<a href="${BOOK_PATH}/deuteron%C3%B4mio/deuteron%C3%B4mio-cap%C3%ADtulos-1-5">1-5</a>\n` +
        `<a href="${BOOK_PATH}/lev%C3%ADtico/lev%C3%ADtico-16-20">16-20</a>`;

    return `<html><body><h1><span class="C9DxTc ">Gênesis</span></h1>
<p>Capítulos:</p>
<ul>\n<li>${navAnchors.replace(/\n/g, '</li>\n<li>')}</li>\n<li>${ownAnchors.replace(/\n/g, '</li>\n<li>')}</li>\n</ul>
</body></html>`;
}

function groupPage(chapterVerseCounts: number[]): string {
    // Build `GEN c:v text` verses for each chapter with the given verse count.
    const paras: string[] = [];
    let chapter = 1;

    for (const count of chapterVerseCounts) {
        for (let verse = 1; verse <= count; verse++) {
            paras.push(`<p dir="ltr"><span>GEN ${chapter}:${verse} No princípio criou Deus os céus e a terra.</span></p>`);
        }

        chapter += 1;
    }

    return `<html><body>${paras.join('\n')}</body></html>`;
}

// Genesis 1-5: 31 + 25 + 24 + 26 + 32 = 138 verses.
const GENESIS_CHAPTERS = [31, 25, 24, 26, 32];

export const genesisBookPage = bookPage([
    [1, 5], [6, 10], [11, 15], [16, 20], [21, 25], [26, 30],
    [31, 35], [36, 40], [41, 45], [46, 50],
]);

export const genesisGroupPage = groupPage(GENESIS_CHAPTERS);

export const philemonBookPage = `<html><body><h1><span>Filemom</span></h1>
<p dir="ltr">Carta de Paulo a Filemom</p>
<p dir="ltr">CAPÍTULO 1</p>
<p dir="ltr">1 Paulo, prisioneiro de Cristo Jesus, e o irmão Timóteo, a Filemom, o amado, e nosso cooperador;&#160;</p>
<p dir="ltr">2 E à amada Ápia, e a Arquipo nosso companheiro de batalha, e à igreja [que está] em tua casa;&#160;</p>
<p dir="ltr">|fn:&#160; N4: irmã</p>
<p dir="ltr">3 Haja] em vós graça e paz de Deus nosso Pai, e do Senhor Jesus Cristo.</p>
</body></html>`;

export const wordProjectBody = `<html><body>
<div class="textHeader"><h1>  Genesis </h1></div>
<div class="textBody" id="textBody">
<h3>Chapter 1</h3>
<span class="dimver">&#160;</span>
<p><!--span class="verse" id="1">1 </span-->In the beginning God created the heaven and the earth.
<br /><span class="verse" id="2">2 </span>And the earth was without form, and void; and darkness was upon the face of the deep.
<br /><span class="verse" id="3">3 </span>And God said, Let there be light: and there was light.</p>
</div></body></html>`;
