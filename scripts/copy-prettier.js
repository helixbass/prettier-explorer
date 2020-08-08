#!/usr/bin/env node

const path = require('path')
const execa = require('execa')
const fs = require('fs-extra')

const pathToOriginalPrettier = path.join(__dirname, '../../prettier')

const targetDirectory = path.join(__dirname, '../prettier-tmp/copy')

const dontCopy = ['node_modules', 'tests', 'dist', 'docs', 'website']

const run = async () => {
  try {
    await execa('rm', ['-rf', targetDirectory])
    await fs.mkdirp(targetDirectory)

    const dontCopyAbsolute = dontCopy.map((pathPrefix) =>
      path.join(pathToOriginalPrettier, pathPrefix),
    )
    await fs.copy(pathToOriginalPrettier, targetDirectory, {
      filter: (sourcePath) =>
        !dontCopyAbsolute.some((pathPrefix) =>
          sourcePath.startsWith(pathPrefix),
        ),
    })
  } catch (error) {
    console.error(error)
  }
}

run()
