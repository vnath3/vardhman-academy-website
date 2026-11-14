import {test,expect} from '@playwright/test';
import {stubAnalytics} from './analytics.mjs';
test.beforeEach(async({page})=>stubAnalytics(page));
for(const width of [1440,768,390,320]){
  test('public content omits fictional alumni and unfinished notes at '+width+'px',async({page})=>{
    await page.setViewportSize({width,height:900});await page.goto('/');
    await expect(page.locator('#stories, #storyModal, .student-voices, .teacher .placeholder, a[href="#stories"]')).toHaveCount(0);
    expect(await page.locator('body').innerText()).not.toMatch(/sample story|Concept preview|Interactive concept|final launch|final page|Reserved for real|as shared by the academy|map pin once/i);
    await expect(page.locator('.proof-seal strong')).toHaveText('5,000+');
    await expect(page.locator('.hero-trust p')).toContainText('5,000+ students taught');
    await expect(page.locator('.teacher-copy')).toContainText('5,000+ students');
    const broken=await page.locator('a[href^="#"]').evaluateAll(links=>links.filter(link=>!document.getElementById(link.getAttribute('href').slice(1))).map(link=>link.getAttribute('href')));
    expect(broken).toEqual([]);
  });
}
