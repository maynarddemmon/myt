module('myt-toNameCase');

test("Falsy and whitespace-only input returns empty string.", function() {
    ok(myt.toNameCase('') === '', 'Empty string.');
    ok(myt.toNameCase(null) === '', 'Null.');
    ok(myt.toNameCase(undefined) === '', 'Undefined.');
    ok(myt.toNameCase('   ') === '', 'Whitespace only.');
});

test("Basic names are title cased regardless of input case.", function() {
    ok(myt.toNameCase('john smith') === 'John Smith', 'All lowercase.');
    ok(myt.toNameCase('JOHN SMITH') === 'John Smith', 'All uppercase.');
    ok(myt.toNameCase('jOhN sMiTh') === 'John Smith', 'Mixed case.');
});

test("Runs of whitespace are collapsed and the string is trimmed.", function() {
    ok(myt.toNameCase('john    smith') === 'John Smith', 'Interior run collapses to one space.');
    ok(myt.toNameCase('  smith') === 'Smith', 'Leading whitespace removed.');
    ok(myt.toNameCase('smith  ') === 'Smith', 'Trailing whitespace removed.');
});

test("Names are split on apostrophes and hyphens, not just spaces.", function() {
    ok(myt.toNameCase("o'brien") === "O'Brien", 'Straight apostrophe.');
    ok(myt.toNameCase('o\u2019brien') === 'O\u2019Brien', 'Typographic apostrophe.');
    ok(myt.toNameCase('mary-jane watson') === 'Mary-Jane Watson', 'Hyphen.');
    ok(myt.toNameCase("d'artagnan") === "D'Artagnan", 'Leading D apostrophe.');
});

test("Mac and Mc prefixes capitalize the following letter.", function() {
    ok(myt.toNameCase('macdonald') === 'MacDonald', 'Mac prefix.');
    ok(myt.toNameCase('macarthur') === 'MacArthur', 'Mac prefix before a vowel.');
    ok(myt.toNameCase('mcdonald') === 'McDonald', 'Mc prefix.');
});

test("Mac exceptions are not treated as prefixes.", function() {
    // Names that merely start with the letters "mac" but are not Mac- names.
    ok(myt.toNameCase('machado') === 'Machado', 'Machado.');
    ok(myt.toNameCase('macias') === 'Macias', 'Macias.');
    ok(myt.toNameCase('mackie') === 'Mackie', 'Mackie.');
    
    // Too few letters after the prefix to qualify.
    ok(myt.toNameCase('mack') === 'Mack', 'Mack.');
    ok(myt.toNameCase('mace') === 'Mace', 'Mace.');
    
    // Exceptions that are corrected back after the general prefix rule runs.
    ok(myt.toNameCase('macisaac') === 'MacIsaac', 'MacIsaac.');
    ok(myt.toNameCase('macmurdo') === 'MacMurdo', 'MacMurdo.');
});

test("Nobiliary particles are lowercased when they are not the first word.", function() {
    ok(myt.toNameCase('ludwig van beethoven') === 'Ludwig van Beethoven', 'van.');
    ok(myt.toNameCase('otto von bismarck') === 'Otto von Bismarck', 'von.');
    ok(myt.toNameCase('leonardo da vinci') === 'Leonardo da Vinci', 'da.');
    ok(myt.toNameCase('oscar de la renta') === 'Oscar de la Renta', 'de la.');
    ok(myt.toNameCase('giovanni della casa') === 'Giovanni della Casa', 'della.');
    ok(myt.toNameCase('jean le carre') === 'Jean le Carre', 'le.');
    ok(myt.toNameCase('osama al fayed') === 'Osama al Fayed', 'al.');
});

test("A leading particle is still capitalized unless individualFields is set.", function() {
    // The final "force first character uppercase" step wins over the particle rules.
    ok(myt.toNameCase('van morrison') === 'Van Morrison', 'Leading van is capitalized.');
    ok(myt.toNameCase('de la cruz') === 'De la Cruz', 'Leading de is capitalized.');
    
    // With individualFields the first character is left as the particle rules made it,
    // which is what you want when the value is one field of a larger name.
    ok(myt.toNameCase('van gogh', true) === 'van Gogh', 'individualFields keeps van lowercase.');
    ok(myt.toNameCase('de la cruz', true) === 'de la Cruz', 'individualFields keeps de lowercase.');
    ok(myt.toNameCase('smith', true) === 'Smith', 'individualFields does not lowercase a normal name.');
});

test("Common lowercase words are lowercased.", function() {
    ok(myt.toNameCase('lord of the rings') === 'Lord of the Rings', 'of and the.');
    ok(myt.toNameCase('jack and jill') === 'Jack and Jill', 'and.');
});

test("Trailing roman numerals are uppercased.", function() {
    ok(myt.toNameCase('henry viii') === 'Henry VIII', 'VIII.');
    ok(myt.toNameCase('louis xiv') === 'Louis XIV', 'XIV.');
    ok(myt.toNameCase('elizabeth ii') === 'Elizabeth II', 'II.');
    ok(myt.toNameCase('john iii') === 'John III', 'III.');
});

test("Single digit X names are uppercased.", function() {
    ok(myt.toNameCase('malcolm 2x') === 'Malcolm 2X', 'Single digit.');
    // Documents current behavior: the rule only matches one digit.
    ok(myt.toNameCase('malcolm 10x') === 'Malcolm 10x', 'Multiple digits are not matched.');
});

test("Titles and suffixes are normalized.", function() {
    ok(myt.toNameCase('mr smith') === 'Mr Smith', 'Mr.');
    ok(myt.toNameCase('ms jones') === 'Ms Jones', 'Ms.');
    ok(myt.toNameCase('dr who') === 'Dr Who', 'Dr.');
    ok(myt.toNameCase('st james') === 'St James', 'St.');
});

test("A leading pair of consonants is uppercased.", function() {
    // This is the rule the (?:^|\s) alternation guards. Before the escaping was
    // corrected it read (?:^|\\s), which matches a literal backslash followed by
    // an "s", so only the start-of-string branch could ever match.
    ok(myt.toNameCase('jj abrams') === 'JJ Abrams', 'At the start of the string.');
    ok(myt.toNameCase('jd salinger') === 'JD Salinger', 'At the start of the string.');
    ok(myt.toNameCase('bb king') === 'BB King', 'At the start of the string.');
});

test("A pair of consonants after a space is uppercased.", function() {
    // These are the cases that silently failed before the regex fix.
    ok(myt.toNameCase('steven jd hall') === 'Steven JD Hall', 'Mid string after a space.');
});

test("Only the first consonant pair is uppercased.", function() {
    // Documents current behavior: the replace has no g flag, so a second pair
    // later in the string is left title cased rather than uppercased.
    ok(
        myt.toNameCase('jj abrams and jd salinger') === 'JJ Abrams and Jd Salinger',
        'Second pair is not uppercased.'
    );
});

test("The Spanish y particle keeps the space that follows it.", function() {
    ok(myt.toNameCase('juan y maria') === 'Juan y Maria', 'Single y. Got: ' + myt.toNameCase('juan y maria'));
    ok(myt.toNameCase('maria y juan y jose') === 'Maria y Juan y Jose', 'Repeated y. Got: ' + myt.toNameCase('maria y juan y jose'));
    ok(myt.toNameCase('john y. smith') === 'John Y. Smith', 'Initail with ".". Got: ' + myt.toNameCase('john y. smith'));
});