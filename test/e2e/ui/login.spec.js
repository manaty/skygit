import { test, expect } from '@playwright/test';

test('renders the login screen for a fresh browser session', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Enter your GitHub Personal Access Token' })).toBeVisible();
  await expect(page.getByText('Your token is stored in this browser and used directly with the GitHub API.')).toBeVisible();
  await expect(page.getByPlaceholder('ghp_...')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Authenticate' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close participants modal' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Dismiss participants modal' })).toHaveCount(0);
  await expect(page.getByText('Select a conversation from the sidebar to view it.')).toHaveCount(0);
  await expect(page.getByText('No upload destination')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Generate one here' })).toHaveAttribute(
    'href',
    /github\.com\/settings\/tokens\/new/
  );
  expect(consoleErrors).toEqual([]);
});

test('login help modals expose accessible close controls', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/');

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
