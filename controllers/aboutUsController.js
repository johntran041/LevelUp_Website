const fetch = require('node-fetch');

exports.renderAboutUsPage = async (req, res) => {
    try {
        const response = await fetch('https://restcountries.com/v3.1/region/asia');
        const countries = await response.json();

        // Map and extract needed info
        let countryData = countries.map(country => ({
            name: country.name.common,
            flag: country.flags.svg,
            capital: country.capital ? country.capital[0] : "N/A"
        }));

        // Prioritize Vietnam and Taiwan
        const vietnam = countryData.find(c => c.name.toLowerCase() === "vietnam");
        const taiwan = countryData.find(c => c.name.toLowerCase() === "taiwan");

        // Filter out Vietnam and Taiwan from the original list
        countryData = countryData.filter(c => c.name.toLowerCase() !== "vietnam" && c.name.toLowerCase() !== "taiwan");

        // Put Vietnam and Taiwan at the top, then take the next 4
        const selectedCountries = [vietnam, taiwan, ...countryData.slice(0, 4)];

        res.render("AboutUs", { asianCountries: selectedCountries });
    } catch (error) {
        console.log("Error rendering About Us page with Asian countries:", error);
        res.render("AboutUs", { asianCountries: [] });
    }
};
