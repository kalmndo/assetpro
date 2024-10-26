import monthToRoman from "./monthToRomans"

function getPenomoran (props: {number: number, code: string, year: string}){
    const {number, code, year} = props

    return `${String(number + 1).padStart(4,'0')}/${code}/${monthToRoman(new Date())}/${year}`
}

export default getPenomoran