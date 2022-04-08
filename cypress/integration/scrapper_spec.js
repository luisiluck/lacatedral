describe('csv', () => {
    it('scrapper', () => {
        const filename = `laCatedralPrecios${new Date().toISOString().split('T')[0]}.csv`
        cy.writeFile(filename, `"COD";"CAT";"DES";"UNI";"PRE"\n`)
        cy.visit("https://santerialacatedral.com.ar/login")
        cy.get('[href="/logout/"]', { timeout: 60000 }).should('be.visible');
        cy.visit("https://santerialacatedral.com.ar/productos")
        const scrap = (cat) => {
            let page = ''
            cy.get('body').then(body=>{
                let items = body.find('.thumbnail.col-lg-12')
                if (items.length > 0) {
                    cy.wrap(items).each(
                        ($el) => {
                            let d = $el.find('a.col-lg-12').text().trim()
                            let u = d.match(/ X \d+ /i)?.[0].match(/\d+/)?.[0] || 1
                            let c = $el.find('.col-xs-12 > div.clearfix').text().split(': ')[1].trim()
                            let p = $el.find('.precio').text().split(': $')[1].trim()
                            cy.log(c,d,p)
                            page = page + `"${c}";"${cat}";"${d}";${u};${p}\n`
                        }
                    ).then(()=> {
                        cy.log(`writing: ${page}`)
                        cy.writeFile(filename, page, { flag: 'a+' })
                    })
                }
            })
        }
        const page = (cat) => {
            scrap(cat)
            cy.get('body').then( body =>{
                let arrow = body.find('.pagination > :last')
                if(arrow.length > 0 && arrow.is(':visible')){
                    cy.wrap(arrow).click()
                    page(cat)
                }
            })
        }
        const category = () => {
            cy.get('.panel li').each( (e, i) => {
                cy.get(`.panel > .row > :nth-child(${i+1}) > a`).click().then( el =>{
                    cy.log(`categoria: ${el.text().trim()}`)
                    page(el.text().trim())
                })

            })
        }
        category()
    })
})