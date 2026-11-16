/* Navega pelas entradas diretas e pelos submenus do Órbita Flow. */
async function navClick(page,selector){
 if(await page.locator('#painel').evaluate(d=>d.open)){await page.keyboard.press('Escape');await page.waitForTimeout(250);}
 const mobile=page.locator('.abrir-menu');
 if(await mobile.isVisible()&&!await page.locator('.lateral').evaluate(n=>n.classList.contains('aberta'))){await mobile.click();await page.waitForTimeout(350);}
 const rota=page.locator(selector);
 const pai=await rota.getAttribute('data-pai-nav');
 if(pai){const grupo=page.locator('[data-grupo-nav="'+pai+'"]');if(await grupo.getAttribute('aria-expanded')!=='true')await grupo.click();}
 await rota.click();
}
module.exports={navClick};
