const KANA_ROWS = [
  ['아행', ['あ','い','う','え','お']], ['카행', ['か','き','く','け','こ']],
  ['사행', ['さ','し','す','せ','そ']], ['타행', ['た','ち','つ','て','と']],
  ['나행', ['な','に','ぬ','ね','の']], ['하행', ['は','ひ','ふ','へ','ほ']],
  ['마행', ['ま','み','む','め','も']], ['야행', ['や',null,'ゆ',null,'よ']],
  ['라행', ['ら','り','る','れ','ろ']], ['와행', ['わ',null,null,null,'を']],
  ['발음', ['ん',null,null,null,null]]
];
const KANA_SETS = {
  basic: { label: '기본 46자', rows: KANA_ROWS },
  dakuten: { label: '탁음', rows: [
    ['가행', ['が','ぎ','ぐ','げ','ご']], ['자행', ['ざ','じ','ず','ぜ','ぞ']],
    ['다행', ['だ','ぢ','づ','で','ど']], ['바행', ['ば','び','ぶ','べ','ぼ']]
  ] },
  handakuten: { label: '반탁음', rows: [['파행', ['ぱ','ぴ','ぷ','ぺ','ぽ']]] },
  yoon: { label: '요음', rows: [
    ['き', ['きゃ',null,'きゅ',null,'きょ']], ['し', ['しゃ',null,'しゅ',null,'しょ']],
    ['ち', ['ちゃ',null,'ちゅ',null,'ちょ']], ['に', ['にゃ',null,'にゅ',null,'にょ']],
    ['ひ', ['ひゃ',null,'ひゅ',null,'ひょ']], ['み', ['みゃ',null,'みゅ',null,'みょ']],
    ['り', ['りゃ',null,'りゅ',null,'りょ']], ['ぎ', ['ぎゃ',null,'ぎゅ',null,'ぎょ']],
    ['じ', ['じゃ',null,'じゅ',null,'じょ']], ['び', ['びゃ',null,'びゅ',null,'びょ']],
    ['ぴ', ['ぴゃ',null,'ぴゅ',null,'ぴょ']]
  ] }
};
const SOUND = {
  'あ':'아','い':'이','う':'우','え':'에','お':'오','か':'카','き':'키','く':'쿠','け':'케','こ':'코',
  'さ':'사','し':'시','す':'스','せ':'세','そ':'소','た':'타','ち':'치','つ':'츠','て':'테','と':'토',
  'な':'나','に':'니','ぬ':'누','ね':'네','の':'노','は':'하','ひ':'히','ふ':'후','へ':'헤','ほ':'호',
  'ま':'마','み':'미','む':'무','め':'메','も':'모','や':'야','ゆ':'유','よ':'요','ら':'라','り':'리',
  'る':'루','れ':'레','ろ':'로','わ':'와','を':'오','ん':'ㄴ',
  'が':'가','ぎ':'기','ぐ':'구','げ':'게','ご':'고','ざ':'자','じ':'지','ず':'즈','ぜ':'제','ぞ':'조',
  'だ':'다','ぢ':'지','づ':'즈','で':'데','ど':'도','ば':'바','び':'비','ぶ':'부','べ':'베','ぼ':'보',
  'ぱ':'파','ぴ':'피','ぷ':'푸','ぺ':'페','ぽ':'포','ゔ':'부',
  'きゃ':'캬','きゅ':'큐','きょ':'쿄','しゃ':'샤','しゅ':'슈','しょ':'쇼','ちゃ':'챠','ちゅ':'츄','ちょ':'쵸',
  'にゃ':'냐','にゅ':'뉴','にょ':'뇨','ひゃ':'햐','ひゅ':'휴','ひょ':'효','みゃ':'먀','みゅ':'뮤','みょ':'묘',
  'りゃ':'랴','りゅ':'류','りょ':'료','ぎゃ':'갸','ぎゅ':'규','ぎょ':'교','じゃ':'쟈','じゅ':'쥬','じょ':'죠',
  'びゃ':'뱌','びゅ':'뷰','びょ':'뵤','ぴゃ':'퍄','ぴゅ':'퓨','ぴょ':'표',
  'てぃ':'티','でぃ':'디','ふぁ':'파','ふぃ':'피','ふぇ':'페','ふぉ':'포','しぇ':'셰','ちぇ':'체'
};
function toKatakana(text) {
  return [...text].map(ch => ch >= 'ぁ' && ch <= 'ゖ' ? String.fromCharCode(ch.charCodeAt(0) + 96) : ch).join('');
}
function toHiragana(text) {
  return [...text].map(ch => ch >= 'ァ' && ch <= 'ヶ' ? String.fromCharCode(ch.charCodeAt(0) - 96) : ch).join('');
}
function category(text) {
  const compact = text.replace(/[\s　]/g, '');
  if (!/^[\u3040-\u309f\u30a0-\u30ffー]+$/.test(compact)) return null;
  if (/^[\u3040-\u309fー]+$/.test(compact)) return '히라가나';
  if (/^[\u30a0-\u30ffー]+$/.test(compact)) return '가타카나';
  return '혼합';
}
function addFinal(text, jong) {
  if (!text) return text;
  const last = text.charCodeAt(text.length - 1) - 0xac00;
  return last >= 0 && last < 11172 && last % 28 === 0
    ? text.slice(0, -1) + String.fromCharCode(text.charCodeAt(text.length - 1) + jong)
    : text;
}
function koreanReading(text) {
  const hira = toHiragana(text).replace(/\s/g, '');
  let result = '';
  for (let i = 0; i < hira.length;) {
    const ch = hira[i];
    if (ch === 'っ') {
      const next = hira[i + 1] || '';
      result = addFinal(result, 'かきくけこがぎぐげご'.includes(next) ? 1 : 'たちつてと'.includes(next) ? 17 : 'ぱぴぷぺぽばびぶべぼ'.includes(next) ? 7 : 19);
      i += 1; continue;
    }
    if (ch === 'ん') {
      const finished = addFinal(result, 4);
      result = finished === result ? result + 'ㄴ' : finished;
      i += 1; continue;
    }
    if (ch === 'ー') {
      const vowel = ['아','이','우','에','오'].find(sound => result.endsWith(sound));
      if (vowel) result += vowel;
      i += 1; continue;
    }
    const pair = hira.slice(i, i + 2);
    if (SOUND[pair]) { result += SOUND[pair]; i += 2; }
    else { result += SOUND[ch] || ch; i += 1; }
  }
  return result;
}
function wordPronunciation(word) {
  return typeof word.pronunciation === 'string' && word.pronunciation.trim()
    ? word.pronunciation.trim() : koreanReading(word.reading);
}
export { KANA_ROWS, KANA_SETS, toKatakana, toHiragana, category, koreanReading, wordPronunciation };
