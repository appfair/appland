/**
 * Minimal localization table for the small set of UI strings the template owns
 * (everything else comes from the appindex.json). Falls back to English when a
 * locale isn't covered here — the app's content remains correctly localized
 * either way.
 */

export interface UIStrings {
  about: string;
  permissions: string;
  releaseNotes: string;
  rawKeyLabel: string;
  whyNoDescription: string;
  noPermissions: string;
  versionLabel: string;
  buildLabel: string;
  bundleIdLabel: string;
  appIdLabel: string;
  privacyLink: string;
  supportLink: string;
  dependenciesLabel: string;
}

const EN: UIStrings = {
  about: 'About',
  permissions: 'Permissions',
  releaseNotes: 'Release notes',
  rawKeyLabel: 'Key',
  whyNoDescription: 'Used by the app on this platform.',
  noPermissions: 'No declared permissions.',
  versionLabel: 'Version',
  buildLabel: 'Build',
  bundleIdLabel: 'Bundle ID',
  appIdLabel: 'Application ID',
  privacyLink: 'Privacy',
  supportLink: 'Support',
  dependenciesLabel: 'Dependencies',
};

const TABLES: Record<string, Partial<UIStrings>> = {
  ar: {
    about: 'حول التطبيق',
    permissions: 'الأذونات',
    releaseNotes: 'ملاحظات الإصدار',
    rawKeyLabel: 'المفتاح',
    whyNoDescription: 'يستخدم بواسطة التطبيق على هذه المنصة.',
    noPermissions: 'لا توجد أذونات معلنة.',
    versionLabel: 'الإصدار',
    buildLabel: 'البنية',
    bundleIdLabel: 'مُعرّف الحزمة',
    appIdLabel: 'مُعرّف التطبيق',
    privacyLink: 'الخصوصية',
    supportLink: 'الدعم',
    dependenciesLabel: 'الاعتماديات',
  },
  de: {
    about: 'Über die App',
    permissions: 'Berechtigungen',
    releaseNotes: 'Versionshinweise',
    rawKeyLabel: 'Schlüssel',
    whyNoDescription: 'Wird von der App auf dieser Plattform verwendet.',
    noPermissions: 'Keine deklarierten Berechtigungen.',
    versionLabel: 'Version',
    buildLabel: 'Build',
    bundleIdLabel: 'Bundle-ID',
    appIdLabel: 'App-ID',
    privacyLink: 'Datenschutz',
    supportLink: 'Support',
    dependenciesLabel: 'Abhängigkeiten',
  },
  es: {
    about: 'Acerca de',
    permissions: 'Permisos',
    releaseNotes: 'Novedades',
    rawKeyLabel: 'Clave',
    whyNoDescription: 'Usado por la app en esta plataforma.',
    noPermissions: 'Sin permisos declarados.',
    versionLabel: 'Versión',
    buildLabel: 'Compilación',
    bundleIdLabel: 'ID del paquete',
    appIdLabel: 'ID de la aplicación',
    privacyLink: 'Privacidad',
    supportLink: 'Soporte',
    dependenciesLabel: 'Dependencias',
  },
  fr: {
    about: 'À propos',
    permissions: 'Autorisations',
    releaseNotes: 'Notes de version',
    rawKeyLabel: 'Clé',
    whyNoDescription: 'Utilisé par l’app sur cette plateforme.',
    noPermissions: 'Aucune autorisation déclarée.',
    versionLabel: 'Version',
    buildLabel: 'Build',
    bundleIdLabel: 'ID du bundle',
    appIdLabel: 'ID de l’application',
    privacyLink: 'Confidentialité',
    supportLink: 'Assistance',
    dependenciesLabel: 'Dépendances',
  },
  hi: {
    about: 'ऐप के बारे में',
    permissions: 'अनुमतियाँ',
    releaseNotes: 'रिलीज़ नोट्स',
    rawKeyLabel: 'कुंजी',
    whyNoDescription: 'इस प्लेटफ़ॉर्म पर ऐप द्वारा उपयोग किया जाता है।',
    noPermissions: 'कोई घोषित अनुमतियाँ नहीं।',
    versionLabel: 'संस्करण',
    buildLabel: 'बिल्ड',
    bundleIdLabel: 'बंडल आईडी',
    appIdLabel: 'ऐप्लिकेशन आईडी',
    privacyLink: 'गोपनीयता',
    supportLink: 'सहायता',
    dependenciesLabel: 'निर्भरताएँ',
  },
  id: {
    about: 'Tentang aplikasi',
    permissions: 'Izin',
    releaseNotes: 'Catatan rilis',
    rawKeyLabel: 'Kunci',
    whyNoDescription: 'Digunakan oleh aplikasi di platform ini.',
    noPermissions: 'Tidak ada izin yang dideklarasikan.',
    versionLabel: 'Versi',
    buildLabel: 'Build',
    bundleIdLabel: 'ID bundel',
    appIdLabel: 'ID aplikasi',
    privacyLink: 'Privasi',
    supportLink: 'Dukungan',
    dependenciesLabel: 'Dependensi',
  },
  it: {
    about: 'Informazioni',
    permissions: 'Autorizzazioni',
    releaseNotes: 'Note di versione',
    rawKeyLabel: 'Chiave',
    whyNoDescription: 'Utilizzato dall’app su questa piattaforma.',
    noPermissions: 'Nessuna autorizzazione dichiarata.',
    versionLabel: 'Versione',
    buildLabel: 'Build',
    bundleIdLabel: 'ID bundle',
    appIdLabel: 'ID applicazione',
    privacyLink: 'Privacy',
    supportLink: 'Supporto',
    dependenciesLabel: 'Dipendenze',
  },
  ja: {
    about: 'アプリについて',
    permissions: '権限',
    releaseNotes: 'リリースノート',
    rawKeyLabel: 'キー',
    whyNoDescription: 'このプラットフォームでアプリが使用します。',
    noPermissions: '宣言された権限はありません。',
    versionLabel: 'バージョン',
    buildLabel: 'ビルド',
    bundleIdLabel: 'バンドル ID',
    appIdLabel: 'アプリ ID',
    privacyLink: 'プライバシー',
    supportLink: 'サポート',
    dependenciesLabel: '依存関係',
  },
  ko: {
    about: '앱 정보',
    permissions: '권한',
    releaseNotes: '릴리스 노트',
    rawKeyLabel: '키',
    whyNoDescription: '이 플랫폼에서 앱이 사용합니다.',
    noPermissions: '선언된 권한이 없습니다.',
    versionLabel: '버전',
    buildLabel: '빌드',
    bundleIdLabel: '번들 ID',
    appIdLabel: '앱 ID',
    privacyLink: '개인정보 처리방침',
    supportLink: '지원',
    dependenciesLabel: '종속성',
  },
  pt: {
    about: 'Sobre',
    permissions: 'Permissões',
    releaseNotes: 'Notas da versão',
    rawKeyLabel: 'Chave',
    whyNoDescription: 'Usado pelo app nesta plataforma.',
    noPermissions: 'Sem permissões declaradas.',
    versionLabel: 'Versão',
    buildLabel: 'Build',
    bundleIdLabel: 'ID do bundle',
    appIdLabel: 'ID do aplicativo',
    privacyLink: 'Privacidade',
    supportLink: 'Suporte',
    dependenciesLabel: 'Dependências',
  },
  ru: {
    about: 'О приложении',
    permissions: 'Разрешения',
    releaseNotes: 'Заметки о выпуске',
    rawKeyLabel: 'Ключ',
    whyNoDescription: 'Используется приложением на этой платформе.',
    noPermissions: 'Разрешения не заявлены.',
    versionLabel: 'Версия',
    buildLabel: 'Сборка',
    bundleIdLabel: 'ID пакета',
    appIdLabel: 'ID приложения',
    privacyLink: 'Конфиденциальность',
    supportLink: 'Поддержка',
    dependenciesLabel: 'Зависимости',
  },
  zh: {
    about: '关于',
    permissions: '权限',
    releaseNotes: '版本说明',
    rawKeyLabel: '键',
    whyNoDescription: '此平台上的应用会使用。',
    noPermissions: '未声明任何权限。',
    versionLabel: '版本',
    buildLabel: '构建',
    bundleIdLabel: 'Bundle ID',
    appIdLabel: '应用 ID',
    privacyLink: '隐私',
    supportLink: '支持',
    dependenciesLabel: '依赖项',
  },
};

export function uiStrings(locale: string): UIStrings {
  // Try the exact code, then the language part, then English.
  const lang = locale.split('-')[0]!;
  return { ...EN, ...(TABLES[locale] ?? {}), ...(TABLES[lang] ?? {}) };
}
