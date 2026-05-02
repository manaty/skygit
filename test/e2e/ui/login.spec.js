import { test, expect } from '@playwright/test';

const expectedBasePath = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173/').pathname;
const appEntryUrl = process.env.PLAYWRIGHT_BASE_URL || '/';

test('renders the login screen for a fresh browser session', async ({ page }) => {
  const consoleErrors = [];
  const consoleMessages = [];
  page.on('console', (message) => {
    consoleMessages.push(message.text());
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto(appEntryUrl);
  await page.reload();
  await page.waitForLoadState('networkidle');

  expect(new URL(page.url()).pathname).toBe(expectedBasePath);
  await expect(page.getByRole('heading', { name: 'Enter your GitHub Personal Access Token' })).toBeVisible();
  await expect(page.getByText('Your token is stored in this browser and used directly with the GitHub API.')).toBeVisible();
  await expect(page.getByLabel('GitHub Personal Access Token')).toBeVisible();
  await expect(page.getByLabel('GitHub Personal Access Token')).toHaveAttribute('type', 'password');
  await expect(page.getByRole('button', { name: 'Authenticate' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close participants modal' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Dismiss participants modal' })).toHaveCount(0);
  await expect(page.getByText('Select a conversation from the sidebar to view it.')).toHaveCount(0);
  await expect(page.getByText('No upload destination')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /participants/i })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Generate one here' })).toHaveAttribute(
    'href',
    /github\.com\/settings\/tokens\/new/
  );
  await expect.poll(
    () => page.evaluate(() => Object.keys(window).filter(key => key.startsWith('skygit')).length)
  ).toBe(0);
  await expect.poll(
    () => page.evaluate(() => document.querySelectorAll('[aria-valuenow], progress').length)
  ).toBe(0);
  expect(consoleErrors).toEqual([]);
  expect(consoleErrors.some(error => error.includes('[Call Debug]'))).toBe(false);
  expect(consoleMessages.some(message => message.includes('[SkyGit][Presence]'))).toBe(false);
  expect(consoleMessages.some(message => message.includes('[SessionManager]'))).toBe(false);
  expect(consoleMessages.some(message => message.includes('[Recorder]'))).toBe(false);
  expect(consoleMessages.some(message => message.includes('⏩ Payload'))).toBe(false);
  expect(consoleMessages.some(message => message.includes('Streaming saved'))).toBe(false);
  expect(consoleMessages.some(message => message.includes('Auto-discovering conversations'))).toBe(false);
  expect(consoleMessages.some(message => message.includes('handleCreate() called'))).toBe(false);
  expect(consoleMessages.some(message => message.includes('[Discovery]'))).toBe(false);
  expect(consoleMessages.some(message => message.includes('Connection timeout'))).toBe(false);
});

test('login help modals expose accessible close controls', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto(appEntryUrl);

  await page.getByRole('button', { name: 'How to create a token?' }).click();
  await expect(page.getByRole('heading', { name: 'How to create a GitHub Token' })).toBeVisible();
  await page.getByRole('button', { name: 'Close token help' }).first().click();
  await expect(page.getByRole('heading', { name: 'How to create a GitHub Token' })).toBeHidden();

  await page.getByRole('button', { name: 'How SkyGit works?' }).click();
  await expect(page.getByRole('heading', { name: 'How SkyGit Works' })).toBeVisible();
  await page.getByRole('button', { name: 'Close how SkyGit works modal' }).first().click();
  await expect(page.getByRole('heading', { name: 'How SkyGit Works' })).toBeHidden();
  expect(consoleErrors).toEqual([]);
});

test('login token input remains stable while opening help content', async ({ page }) => {
  await page.goto(appEntryUrl);

  const tokenInput = page.getByLabel('GitHub Personal Access Token');
  await tokenInput.fill('ghp_exampletoken');
  await page.getByRole('button', { name: 'How SkyGit works?' }).click();
  await expect(page.getByRole('heading', { name: 'How SkyGit Works' })).toBeVisible();
  await page.getByRole('button', { name: 'Close how SkyGit works modal' }).first().click();

  await expect(tokenInput).toHaveValue('ghp_exampletoken');
});
