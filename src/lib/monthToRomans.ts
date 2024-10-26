function monthToRoman(date: Date) {
    const monthsInRoman = [
        'I',   // January
        'II',  // February
        'III', // March
        'IV',  // April
        'V',   // May
        'VI',  // June
        'VII', // July
        'VIII',// August
        'IX',  // September
        'X',   // October
        'XI',  // November
        'XII'  // December
    ];
    
    const monthIndex = date.getMonth(); // getMonth() returns 0-11
    return monthsInRoman[monthIndex];
}

export default monthToRoman