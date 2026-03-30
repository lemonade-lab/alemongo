import YAML from 'js-yaml'
import { isMap, isScalar, isSeq, parseDocument } from 'yaml'

export const validateYaml = (content: string) => {
  if (!content.trim()) return
  YAML.load(content)
}

export const formatYamlPreserveComments = (content: string) => {
  if (!content.trim()) return ''
  const doc = parseDocument(content)
  if (doc.errors.length > 0) {
    throw doc.errors[0]
  }
  return String(doc)
}

export const updateYamlAppsPreserveComments = (
  content: string,
  pkgName: string,
  enable: boolean
) => {
  const source = content.trim() ? content : '{}\n'
  const doc = parseDocument(source)
  if (doc.errors.length > 0) {
    throw doc.errors[0]
  }

  if (doc.contents == null) {
    if (!enable) {
      return {
        changed: false,
        content: String(doc)
      }
    }
    doc.set('apps', [pkgName])
    return {
      changed: true,
      content: String(doc)
    }
  }

  if (!isMap(doc.contents)) {
    throw new Error('YAML 根节点必须是对象')
  }

  const appsNode = doc.get('apps', true)

  if (!appsNode) {
    if (!enable) {
      return {
        changed: false,
        content: String(doc)
      }
    }
    doc.set('apps', [pkgName])
    return {
      changed: true,
      content: String(doc)
    }
  }

  if (!isSeq(appsNode)) {
    throw new Error('apps 字段必须是数组')
  }

  const values = appsNode.items.map(item => {
    if (isScalar(item)) {
      return String(item.value ?? '')
    }
    return ''
  })

  const index = values.indexOf(pkgName)

  if (enable) {
    if (index >= 0) {
      return {
        changed: false,
        content: String(doc)
      }
    }
    appsNode.add(pkgName)
    return {
      changed: true,
      content: String(doc)
    }
  }

  if (index < 0) {
    return {
      changed: false,
      content: String(doc)
    }
  }

  appsNode.items.splice(index, 1)
  return {
    changed: true,
    content: String(doc)
  }
}