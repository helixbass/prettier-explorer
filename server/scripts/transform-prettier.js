#!/usr/bin/env node

const path = require('path')
const execa = require('execa')
const fs = require('fs-extra')

const {
  getCopyTargetDirectory,
  getTransformedTargetDirectory,
  getBabelPluginPath,
} = require('./utils')

const sourceDirectory = getCopyTargetDirectory()
const targetDirectory = getTransformedTargetDirectory()

const dontCopy = ['src']

const run = async () => {
  try {
    await execa('rm', ['-rf', targetDirectory])
    await fs.mkdirp(targetDirectory)

    const dontCopyAbsolute = dontCopy.map((pathPrefix) =>
      path.join(sourceDirectory, pathPrefix),
    )
    await fs.copy(sourceDirectory, targetDirectory, {
      filter: (sourcePath) =>
        !dontCopyAbsolute.some((pathPrefix) =>
          sourcePath.startsWith(pathPrefix),
        ),
    })
    await execa('yarn', [
      'babel',
      path.join(sourceDirectory, 'src'),
      '--out-dir',
      path.join(targetDirectory, 'src'),
      `--plugins=${getBabelPluginPath()}`,
    ])
  } catch (error) {
    console.error(error)
  }
}

run()
