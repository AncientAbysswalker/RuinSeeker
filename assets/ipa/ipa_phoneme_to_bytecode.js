/** @type {Object.<string, {byteCode: number, isVowel: boolean}} */
const ipaPhonemeToByteCodeAndVowel = {
    // Consonant Phonemes			
    'b': {
        byteCode: 0b000010000010,
        isVowel: false
    },
    'd': {
        byteCode: 0b000011000010,
        isVowel: false
    },
    'f': {
        byteCode: 0b001001010000,
        isVowel: false
    },
    'ɡ': {
        byteCode: 0b001010010000,
        isVowel: false
    },
    'h': {
        byteCode: 0b001010000010,
        isVowel: false
    },
    'dʒ': {
        byteCode: 0b000001000010,
        isVowel: false
    },
    'k': {
        byteCode: 0b000010010010,
        isVowel: false
    },
    'ɫ': {
        byteCode: 0b001000000010,
        isVowel: false
    },
    'm': {
        byteCode: 0b000011000000,
        isVowel: false
    },
    'n': {
        byteCode: 0b000011001000,
        isVowel: false
    },
    'p': {
        byteCode: 0b001000010000,
        isVowel: false
    },
    'ɹ': {
        byteCode: 0b001000010010,
        isVowel: false
    },
    's': {
        byteCode: 0b001001010010,
        isVowel: false
    },
    't': {
        byteCode: 0b001000011000,
        isVowel: false
    },
    'v': {
        byteCode: 0b000010001010,
        isVowel: false
    },
    'w': {
        byteCode: 0b000000011000,
        isVowel: false
    },
    'j': {
        byteCode: 0b001000001010,
        isVowel: false
    },
    'z': {
        byteCode: 0b001010001010,
        isVowel: false
    },

    // Digraph Phonemes			
    'tʃ': {
        byteCode: 0b001000001000,
        isVowel: false
    },
    'ʃ': {
        byteCode: 0b001011011000,
        isVowel: false
    },
    'ŋ': {
        byteCode: 0b001011011010,
        isVowel: false
    },
    'θ': {
        byteCode: 0b001000011010,
        isVowel: false
    },
    'ð': {
        byteCode: 0b001011000010,
        isVowel: false
    },
    'ʒ': {
        byteCode: 0b000011011010,
        isVowel: false
    },

    // R-controlled Phonemes
    'ɑɹ': {
        byteCode: 0b010100000101,
        isVowel: true
    },
    'ɛɹ': {
        byteCode: 0b010000100000,
        isVowel: true
    },
    'ɪɹ': {
        byteCode: 0b010000100001,
        isVowel: true
    },
    'ɔɹ': {
        byteCode: 0b010000100101,
        isVowel: true
    },
    'ʊɹ': {
        byteCode: 0b010000100101,
        isVowel: true
    },
    'ɝ': {
        byteCode: 0b010100100100,
        isVowel: true
    },

    // Vowel Phonemes
    'eɪ': {
        byteCode: 0b000000000001,
        isVowel: true
    },
    'i': {
        byteCode: 0b010100100001,
        isVowel: true
    },
    'aɪ': {
        byteCode: 0b000000000100,
        isVowel: true
    },
    'oʊ': {
        byteCode: 0b010100100101,
        isVowel: true
    },
    'æ': {
        byteCode: 0b000000100101,
        isVowel: true
    },
    'ɛ': {
        byteCode: 0b010100100000,
        isVowel: true
    },
    'ɪ': {
        byteCode: 0b010100000000,
        isVowel: true
    },
    'ɑ': {
        byteCode: 0b000000100001,
        isVowel: true
    },
    'ɔ': {
        byteCode: 0b000000100001,
        isVowel: true
    },
    'ə': {
        byteCode: 0b000000000101,
        isVowel: true
    },
    'ʊ': {
        byteCode: 0b000100100000,
        isVowel: true
    },
    'u': {
        byteCode: 0b000100100101,
        isVowel: true
    },
    'aʊ': {
        byteCode: 0b010000000000,
        isVowel: true
    },
    'ɔɪ': {
        byteCode: 0b000100000000
    }
}

export default ipaPhonemeToByteCodeAndVowel;