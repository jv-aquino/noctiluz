import { test, expect } from '@playwright/test'
 
test('should navigate to the cadastro page', async ({ page }) => {
  await page.goto('http://localhost:3000/')
  await page.click('text=Embarque agora')

  await expect(page).toHaveURL('http://localhost:3000/cadastro')

  await expect(page.locator('h2')).toContainText('Aprenda se divertindo!')
})