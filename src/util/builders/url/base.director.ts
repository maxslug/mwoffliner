import urlBuilder from './url.builder.js'

/**
 * Interface to build URLs based on base URL
 */
export default class BaseURLDirector {
  private baseDomain: string

  constructor(baseDomain: string) {
    this.baseDomain = baseDomain
  }

  buildURL(path: string) {
    return urlBuilder.setDomain(this.baseDomain).setPath(path).build(true)
  }

  buildWikimediaApiURL(path?: string) {
    return urlBuilder
      .setDomain(this.baseDomain)
      .setPath(path ?? 'api/rest_v1')
      .build(true, '/')
  }

  buildDesktopApiUrl(path?: string) {
    return urlBuilder
      .setDomain(this.baseDomain)
      .setPath(path ?? 'api/rest_v1/page/html')
      .build(true, '/')
  }

  buildMobileApiUrl(path?: string) {
    return urlBuilder
      .setDomain(this.baseDomain)
      .setPath(path ?? 'api/rest_v1/page/mobile-html')
      .build(true, '/')
  }

  buildModuleURL(path?: string) {
    return urlBuilder
      .setDomain(this.baseDomain)
      .setPath(path ?? 'w/load.php')
      .build(false, '?')
  }
}
