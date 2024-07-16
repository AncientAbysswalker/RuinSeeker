# Ruin Seeker
> For translating English into the language of Tunic (AKA Trunic)

![Logo](https://raw.githubusercontent.com/AncientAbysswalker/RuinSeeker/master/assets/fox.ico)

## Application
The working web app can be [accessed here](https://ruinseeker.cerberus-heuristics.com/).

## Purpose
I started programming this several years ago when I first played Tunic around its release. I fell in love with the game's style and nostalgic aesthetic. I wanted to try making a tool that would allow you to translate english text into the wonderful runes we all know and love.

## Theory

Before I could start this project I needed to look into the language theory about the phoenetics of English, as I have no background or understanding of this, and it is the basis of how the language of Tunic is transcribed. The International Phoenetic Alphabet (IPA) defines 44 phonemes (units of phoenetic) to describe the english language, as shown below. I also found [this breakdown](https://magoosh.com/english-speaking/44-phonemes-in-english-and-other-sound-blends/) of phonemes useful for my understanding. [This breakdown](https://www.dyslexia-reading-well.com/44-phonemes-in-english.html) was also useful.

![Phoneme Table](https://raw.githubusercontent.com/AncientAbysswalker/RuinSeeker/master/readme/phoneme.jpg)

The next thing to do was to determine the mapping of tunic characters to phonemes. Unfortunately as I was developing this very early after the game's release there was very little information on this, and many of the resources and translations were contradictory, inconsistent, and wrong. As a result this part tookk me significantly longer than I expected and required alot of manual work translating text to back-confirm the consistency of translation. Fortunately we now have a consistent and correct translation metric, which is shown below. Given the english language can have many pronounciations and different emphasis, there are actually many different phonemes that are similar, and as such there might be several different phonemes or IPA representations that could map to a single Tunic character. This can be seen with ```fair``` being well represented by either of ```fɛɹ``` or ```fe‍əʳ```. In order to translate from english into phonetics I made use of dictionaries sich as those available [here](https://github.com/open-dict-data/ipa-dict). Since Tunic is created by a game developer from the US, it follows the phonetic structure of the US English.

![IPA Table](https://raw.githubusercontent.com/AncientAbysswalker/RuinSeeker/master/readme/trunic.png)

The last thing required to get started was to determine how I wanted to represent or encode the characters. Looking at the way characters are composed, with each character consisting of 12 individual components, I though of each character similarly to a [7-segment display](https://en.wikipedia.org/wiki/Seven-segment_display) consisting of 12 segments, and this it made sense for me to encode this as 12 bits. The below image shows how I broke each character into 12 bits. Segment ```x``` does not need a bit, and will appear dependent on one of bits 1,4,5 being true and one of bits 6,7,9 being true - ```(1 ∥ 4 ∥ 5) & (6 ∥ 7 ∥ 9)```.

<img alt="Character Segment Encoding" src="https://raw.githubusercontent.com/AncientAbysswalker/RuinSeeker/master/readme/full_rune.png" width="250">

Aggregating all of this information I was able to construct the following table for reference as I built this tool. The Primary IPA(s) are the IPA representations that are in the dictionary that I used for this tool, and the Secondary IPA(s) are IPA representations that would translate to the same text in Tunic, but are not in my dictionary. These alternate IPA(s) could be things like different emphasis on phonemes, accent, etc.

<span id="phone-table"></a>
| Sound           | Example            | Primary IPA(s) | Secondary IPA(s) | Byte Code      |
|-----------------|--------------------|----------------|------------------|----------------|
| /b/             | beg and bag        | b              |                  | 0b000010000010 |
| /d/             | doe and deal       | d              |                  | 0b000011000010 |
| /f/             | fall and fit       | f              |                  | 0b001001010000 |
| /g/             | goal and gill      | ɡ              |                  | 0b001010010000 |
| /h/             | has and him        | h              |                  | 0b001010000010 |
| /j/             | job and jolt       | dʒ             |                  | 0b000001000010 |
| /k/             | cap and kite       | k              |                  | 0b000010010010 |
| /l/             | lip and load       | ɫ              | l                | 0b001000000010 |
| /m/             | map and moth       | m              |                  | 0b000011000000 |
| /n/             | net and nip        | n              |                  | 0b000011001000 |
| /p/             | pin and plot       | p              |                  | 0b001000010000 |
| /r/             | run and rope       | ɹ              | r                | 0b001000010010 |
| /s/             | sat and small      | s              |                  | 0b001001010010 |
| /t/             | toe and tale       | t              |                  | 0b001000011000 |
| /v/             | vin and volt       | v              |                  | 0b000010001010 |
| /w/             | wait and wind      | w              |                  | 0b000000011000 |
| /y/             | yam and yet        | j              |                  | 0b001000001010 |
| /z/             | zip and zoo        | z              |                  | 0b001010001010 |
| /ch/            | watch and chime    | tʃ             |                  | 0b001000001000 |
| /sh/            | shift and short    | ʃ              |                  | 0b001011011000 |
| /ng/            | ring and sting     | ŋ              |                  | 0b001011011010 |
| /th/ (voiced)   | weather and thin   | θ              |                  | 0b001000011010 |
| /th/ (unvoiced) | thing and thunder  | ð              |                  | 0b001011000010 |
| /zh/            | genre and division | ʒ              |                  | 0b000011011010 |
| /a(r)/          | car and far        | ɑɹ             | ɑ:               | 0b010100000101 |
| /ā(r)/          | fair and chair     | ɛɹ             | e‍əʳ              | 0b010000100000 |
| /i(r)/          | here and steer     | ɪɹ             | ɪəʳ              | 0b010000100001 |
| /o(r)/          | core and door      | ɔɹ,ʊɹ          | ɔ:,ʊəʳ           | 0b010000100101 |
| /u(r)/          | fern and burn      | ɝ              | ɜ:ʳ              | 0b010100100100 |
| /ā/             | day and eight      | eɪ             |                  | 0b000000000001 |
| /ē/             | beet and sleep     | i              |                  | 0b010100100001 |
| /ī/             | pie and sky        | aɪ             |                  | 0b000000000100 |
| /ō/             | boat and row       | oʊ             |                  | 0b010100100101 |
| /a/             | bat and laugh      | æ              |                  | 0b000000100101 |
| /e/             | medical and bread  | ɛ              |                  | 0b010100100000 |
| /i/             | sit and lip        | ɪ              |                  | 0b010100000000 |
| /o/             | swan and hot       | ɑ,ɔ            | ɒ                | 0b000000100001 |
| /u/             | shut and cut       | ə              |                  | 0b000000000101 |
| /oo/            | took and could     | ʊ              |                  | 0b000100100000 |
| /ōō/            | moon and zoo       | u              | ʌ                | 0b000100100101 |
| /ow/            | mouse and cow      | aʊ             |                  | 0b010000000000 |
| /oy/            | coin and toy       | ɔɪ             |                  | 0b000100000000 |          |

**NOTE:** Two Tunic characters have two Primary IPA representations (and also that there are only 42 tunic characters, but 44 english phonemes). This is because the language of Tunic to be the 'same' phoneme, even though they are technically slightly different sounds:
* ɔɹ vs ʊɹ - Core vs Door
* ɑ vs ɔ - Swan vs Hot

## Planned Features

* Enable changing color
* Add more rune styles
* Allow words to be swapped between English and Runes
* Allow swapping between pronounciations for words with multiple
* Add more special in-game characters and punctuation

## Change Log

### 1.1.1
* Added custom translations

### 1.1.0
* Complete overhaul to SVG generation to use svg.js and better class separation
* Add handlers for upcoming features
* Enabled changing size, stroke, and style
