import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages "project sites" serve the app from https://<user>.github.io/<repo>/,
// so asset URLs must be prefixed with /<repo>/. GitHub Actions always defines
// GITHUB_REPOSITORY ("owner/repo"); local builds don't, and fall back to '/'.
// A repo named <user>.github.io is a user site served from the root, so it
// also gets '/'.
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]

export default defineConfig({
  base: repoName && !repoName.endsWith('.github.io') ? `/${repoName}/` : '/',
  plugins: [react()],
})

