const axios = require('axios')
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

exports.helloPubSub = (_, __) => {
    axios
        .get('https://cdn5.editmysite.com/app/store/api/v18/editor/users/131340831/sites/272266540822079550/store-locations/11ea6bdbb805b462b0c80cc47a2ae378/products/33?include=modifiers')
        .then(res => {
            console.log(`statusCode: ${res.status}`)
            let items = res.data.data.modifiers.data
            let flavors = items.filter(item => item.name.includes("Custard Flavors"))[0].choices
                .map(item => item.display_name)
                .sort()
            if (flavors.length == 0) { throw new Error("Found zero flavors") }
            let flavorsString = buildFlavorsString(flavors)
            sendEmail(successMessage(flavorsString))
        })
        .catch(error => {
            console.error(error)
            sendEmail(failureMessage())
            throw new Error(error)
        })
};

function sendEmail(msg) {
    sgMail
        .send(msg)
        .then(() => { console.log('Email sent') })
        .catch((error) => { throw new Error(error) })
}
function buildFlavorsString(flavors) {
    let string = ""
    flavors.forEach(flavor => string = string.concat(flavor, "\n"))
    return string
}

function successMessage(flavors) {
    return message("Current Menu", "Current menu: \n".concat(flavors))
}

function failureMessage() {
    return message("Fetching Menu Failed", "Fetching Menu Failed")
}

function message(subject, body) {
    let to = process.env.TO_ADDRESS
    let from = process.env.FROM_ADDRESS
    return {
        to: to,
        from: from,
        subject: 'Current Rays Flavors',
        text: body,
    }
}