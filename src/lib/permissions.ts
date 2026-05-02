import type { PermissionView } from './types.ts';

/**
 * Canonical permission tables for iOS and Android.
 *
 *  - The iOS list mirrors keys documented under
 *    "Bundle resources › Protected resources" on developer.apple.com.
 *  - The Android list mirrors keys defined in android.Manifest.permission on
 *    developer.android.com/reference/android/Manifest.permission.
 *
 * For each entry we record:
 *   - `label`     — short human-readable name shown next to the icon.
 *   - `icon`      — Material Symbol icon name; the corresponding SVG file
 *                   lives at /icons/permissions/{icon}.svg.
 *   - `sensitivity` — heuristic tier for sorting and styling.
 *   - `group`     — abstract category shared across iOS and Android so the two
 *                   platforms render the same icon for the same capability
 *                   (e.g. NSCameraUsageDescription and android.permission.CAMERA
 *                   both use group=camera, icon=photo_camera).
 *
 * Android also gets a canonical English description (translations live in
 * permission-descriptions.ts) used as a fallback when the appindex.json does
 * not supply one for that key.
 */

export interface PermissionMeta {
  label: string;
  icon: string;
  sensitivity: 'high' | 'medium' | 'low';
  group: string;
}

// iOS UsageDescription keys ──────────────────────────────────────────────────

export const IOS_PERMISSIONS: Record<string, PermissionMeta> = {
  NSAppleEventsUsageDescription:                       { label: 'Control other apps',      icon: 'apps',                   sensitivity: 'high',   group: 'apple_events' },
  NSAppleMusicUsageDescription:                        { label: 'Apple Music',             icon: 'music_note',             sensitivity: 'medium', group: 'music' },
  NSBluetoothAlwaysUsageDescription:                   { label: 'Bluetooth',               icon: 'bluetooth',              sensitivity: 'medium', group: 'bluetooth' },
  NSBluetoothPeripheralUsageDescription:               { label: 'Bluetooth peripheral',    icon: 'bluetooth',              sensitivity: 'medium', group: 'bluetooth' },
  NSCalendarsFullAccessUsageDescription:               { label: 'Calendar (full access)',  icon: 'calendar_month',         sensitivity: 'high',   group: 'calendar' },
  NSCalendarsUsageDescription:                         { label: 'Calendar',                icon: 'calendar_month',         sensitivity: 'high',   group: 'calendar' },
  NSCalendarsWriteOnlyAccessUsageDescription:          { label: 'Calendar (write)',        icon: 'calendar_month',         sensitivity: 'medium', group: 'calendar' },
  NSCameraUsageDescription:                            { label: 'Camera',                  icon: 'photo_camera',           sensitivity: 'high',   group: 'camera' },
  NSContactsUsageDescription:                          { label: 'Contacts',                icon: 'contacts',               sensitivity: 'high',   group: 'contacts' },
  NSDesktopFolderUsageDescription:                     { label: 'Desktop folder',          icon: 'folder',                 sensitivity: 'medium', group: 'storage_folder' },
  NSDocumentsFolderUsageDescription:                   { label: 'Documents folder',        icon: 'folder',                 sensitivity: 'medium', group: 'storage_folder' },
  NSDownloadsFolderUsageDescription:                   { label: 'Downloads folder',        icon: 'folder',                 sensitivity: 'medium', group: 'storage_folder' },
  NSFaceIDUsageDescription:                            { label: 'Face ID',                 icon: 'face',                   sensitivity: 'high',   group: 'biometric' },
  NSFallDetectionUsageDescription:                     { label: 'Fall detection',          icon: 'emergency',              sensitivity: 'high',   group: 'fall_detection' },
  NSFinancialDataUsageDescription:                     { label: 'Financial data',          icon: 'payments',               sensitivity: 'high',   group: 'financial' },
  NSFocusStatusUsageDescription:                       { label: 'Focus status',            icon: 'bedtime',                sensitivity: 'medium', group: 'focus' },
  NSGKFriendListUsageDescription:                      { label: 'Game Center friends',     icon: 'account_circle',         sensitivity: 'medium', group: 'gamecenter' },
  NSHealthClinicalHealthRecordsShareUsageDescription:  { label: 'Clinical health records', icon: 'monitor_heart',          sensitivity: 'high',   group: 'health' },
  NSHealthShareUsageDescription:                       { label: 'Health (read)',           icon: 'monitor_heart',          sensitivity: 'high',   group: 'health' },
  NSHealthUpdateUsageDescription:                      { label: 'Health (write)',          icon: 'favorite',               sensitivity: 'high',   group: 'health' },
  NSHomeKitUsageDescription:                           { label: 'HomeKit',                 icon: 'home',                   sensitivity: 'high',   group: 'homekit' },
  NSIdentityUsageDescription:                          { label: 'Identity',                icon: 'badge',                  sensitivity: 'high',   group: 'identity' },
  NSLocalNetworkUsageDescription:                      { label: 'Local network',           icon: 'lan',                    sensitivity: 'medium', group: 'local_network' },
  NSLocationAlwaysAndWhenInUseUsageDescription:        { label: 'Location (always)',       icon: 'my_location',            sensitivity: 'high',   group: 'location_bg' },
  NSLocationAlwaysUsageDescription:                    { label: 'Location (always)',       icon: 'my_location',            sensitivity: 'high',   group: 'location_bg' },
  NSLocationTemporaryUsageDescriptionDictionary:       { label: 'Location (temporary)',    icon: 'location_on',            sensitivity: 'high',   group: 'location' },
  NSLocationUsageDescription:                          { label: 'Location',                icon: 'location_on',            sensitivity: 'high',   group: 'location' },
  NSLocationWhenInUseUsageDescription:                 { label: 'Location (in use)',       icon: 'location_on',            sensitivity: 'high',   group: 'location' },
  NSMicrophoneUsageDescription:                        { label: 'Microphone',              icon: 'mic',                    sensitivity: 'high',   group: 'microphone' },
  NSMotionUsageDescription:                            { label: 'Motion & fitness',        icon: 'directions_run',         sensitivity: 'medium', group: 'motion' },
  NSNFCReaderUsageDescription:                         { label: 'NFC reader',              icon: 'contactless',            sensitivity: 'medium', group: 'nfc' },
  NSNearbyInteractionUsageDescription:                 { label: 'Nearby interaction',      icon: 'phonelink_ring',         sensitivity: 'medium', group: 'nearby_devices' },
  NSPhotoLibraryAddUsageDescription:                   { label: 'Save to photos',          icon: 'add_photo_alternate',    sensitivity: 'medium', group: 'photos_write' },
  NSPhotoLibraryUsageDescription:                      { label: 'Photo library',           icon: 'photo_library',          sensitivity: 'high',   group: 'photos_read' },
  NSRemindersFullAccessUsageDescription:               { label: 'Reminders (full access)', icon: 'task_alt',               sensitivity: 'high',   group: 'reminders' },
  NSRemindersUsageDescription:                         { label: 'Reminders',               icon: 'task_alt',               sensitivity: 'medium', group: 'reminders' },
  NSSensorKitUsageDescription:                         { label: 'SensorKit',               icon: 'sensors',                sensitivity: 'high',   group: 'sensors' },
  NSSiriUsageDescription:                              { label: 'Siri',                    icon: 'assistant',              sensitivity: 'medium', group: 'voice_assistant' },
  NSSpeechRecognitionUsageDescription:                 { label: 'Speech recognition',      icon: 'record_voice_over',      sensitivity: 'medium', group: 'speech' },
  NSSystemAdministrationUsageDescription:              { label: 'System administration',   icon: 'settings',               sensitivity: 'high',   group: 'sys_admin' },
  NSSystemExtensionUsageDescription:                   { label: 'System extension',        icon: 'settings',               sensitivity: 'high',   group: 'sys_admin' },
  NSUserTrackingUsageDescription:                      { label: 'Tracking',                icon: 'visibility',             sensitivity: 'high',   group: 'tracking' },
  NSVideoSubscriberAccountUsageDescription:            { label: 'TV subscription account', icon: 'account_circle',         sensitivity: 'medium', group: 'subscription' },
  NSVoIPUsageDescription:                              { label: 'VoIP calling',            icon: 'call',                   sensitivity: 'medium', group: 'call' },
  NSWorldSensingUsageDescription:                      { label: 'World sensing',           icon: 'travel_explore',         sensitivity: 'high',   group: 'world_sensing' },
};

// Android permissions ────────────────────────────────────────────────────────

// Note: groups intentionally line up with iOS where the underlying capability
// matches. Same group ⇒ same icon.
export const ANDROID_PERMISSIONS: Record<string, PermissionMeta> = {
  ACCEPT_HANDOVER:                          { label: 'Accept call handover',     icon: 'call',                  sensitivity: 'medium', group: 'call' },
  ACCESS_BACKGROUND_LOCATION:               { label: 'Background location',      icon: 'my_location',           sensitivity: 'high',   group: 'location_bg' },
  ACCESS_COARSE_LOCATION:                   { label: 'Approximate location',     icon: 'location_on',           sensitivity: 'high',   group: 'location' },
  ACCESS_FINE_LOCATION:                     { label: 'Precise location',         icon: 'location_on',           sensitivity: 'high',   group: 'location' },
  ACCESS_NETWORK_STATE:                     { label: 'Network state',            icon: 'public',                sensitivity: 'low',    group: 'internet' },
  ACCESS_NOTIFICATION_POLICY:               { label: 'Do Not Disturb access',    icon: 'notifications',         sensitivity: 'medium', group: 'notifications' },
  ACCESS_WIFI_STATE:                        { label: 'Wi-Fi state',              icon: 'wifi',                  sensitivity: 'low',    group: 'wifi_state' },
  ACTIVITY_RECOGNITION:                     { label: 'Activity recognition',     icon: 'directions_run',        sensitivity: 'medium', group: 'motion' },
  ANSWER_PHONE_CALLS:                       { label: 'Answer calls',             icon: 'call',                  sensitivity: 'high',   group: 'call' },
  AUTHENTICATE_ACCOUNTS:                    { label: 'Authenticate accounts',    icon: 'manage_accounts',       sensitivity: 'medium', group: 'accounts' },
  BLUETOOTH:                                { label: 'Bluetooth',                icon: 'bluetooth',             sensitivity: 'medium', group: 'bluetooth' },
  BLUETOOTH_ADMIN:                          { label: 'Bluetooth admin',          icon: 'bluetooth',             sensitivity: 'medium', group: 'bluetooth' },
  BLUETOOTH_ADVERTISE:                      { label: 'Bluetooth advertise',      icon: 'bluetooth',             sensitivity: 'medium', group: 'bluetooth' },
  BLUETOOTH_CONNECT:                        { label: 'Bluetooth connect',        icon: 'bluetooth',             sensitivity: 'medium', group: 'bluetooth' },
  BLUETOOTH_SCAN:                           { label: 'Bluetooth scan',           icon: 'bluetooth',             sensitivity: 'medium', group: 'bluetooth' },
  BODY_SENSORS:                             { label: 'Body sensors',             icon: 'monitor_heart',         sensitivity: 'high',   group: 'health' },
  BODY_SENSORS_BACKGROUND:                  { label: 'Body sensors (background)', icon: 'monitor_heart',        sensitivity: 'high',   group: 'health' },
  CALL_COMPANION_APP:                       { label: 'Call companion app',       icon: 'call',                  sensitivity: 'medium', group: 'call' },
  CALL_PHONE:                               { label: 'Make calls',               icon: 'call',                  sensitivity: 'high',   group: 'call' },
  CAMERA:                                   { label: 'Camera',                   icon: 'photo_camera',          sensitivity: 'high',   group: 'camera' },
  CHANGE_NETWORK_STATE:                     { label: 'Change network state',     icon: 'public',                sensitivity: 'medium', group: 'internet' },
  CHANGE_WIFI_MULTICAST_STATE:              { label: 'Wi-Fi multicast',          icon: 'wifi',                  sensitivity: 'low',    group: 'wifi_state' },
  CHANGE_WIFI_STATE:                        { label: 'Change Wi-Fi state',       icon: 'wifi',                  sensitivity: 'medium', group: 'wifi_state' },
  CLEAR_APP_CACHE:                          { label: 'Clear app cache',          icon: 'storage',               sensitivity: 'low',    group: 'storage' },
  DETECT_SCREEN_CAPTURE:                    { label: 'Screenshot detection',     icon: 'visibility',            sensitivity: 'medium', group: 'screen_capture' },
  DETECT_SCREEN_RECORDING:                  { label: 'Screen-recording detection', icon: 'visibility',          sensitivity: 'medium', group: 'screen_capture' },
  DISABLE_KEYGUARD:                         { label: 'Disable keyguard',         icon: 'shield',                sensitivity: 'medium', group: 'keyguard' },
  EXPAND_STATUS_BAR:                        { label: 'Expand status bar',        icon: 'flip_to_front',         sensitivity: 'low',    group: 'status_bar' },
  FOREGROUND_SERVICE:                       { label: 'Foreground service',       icon: 'memory',                sensitivity: 'low',    group: 'foreground_service' },
  FOREGROUND_SERVICE_CAMERA:                { label: 'Foreground camera',        icon: 'photo_camera',          sensitivity: 'medium', group: 'camera' },
  FOREGROUND_SERVICE_CONNECTED_DEVICE:      { label: 'Foreground connected device', icon: 'phonelink_ring',     sensitivity: 'medium', group: 'nearby_devices' },
  FOREGROUND_SERVICE_DATA_SYNC:             { label: 'Foreground data sync',     icon: 'memory',                sensitivity: 'low',    group: 'foreground_service' },
  FOREGROUND_SERVICE_HEALTH:                { label: 'Foreground health',        icon: 'monitor_heart',         sensitivity: 'medium', group: 'health' },
  FOREGROUND_SERVICE_LOCATION:              { label: 'Foreground location',      icon: 'location_on',           sensitivity: 'high',   group: 'location' },
  FOREGROUND_SERVICE_MEDIA_PLAYBACK:        { label: 'Foreground media playback', icon: 'music_note',           sensitivity: 'low',    group: 'media_playback' },
  FOREGROUND_SERVICE_MEDIA_PROCESSING:      { label: 'Foreground media processing', icon: 'music_note',         sensitivity: 'medium', group: 'media_playback' },
  FOREGROUND_SERVICE_MEDIA_PROJECTION:      { label: 'Foreground screen capture', icon: 'flip_to_front',        sensitivity: 'high',   group: 'media_projection' },
  FOREGROUND_SERVICE_MICROPHONE:            { label: 'Foreground microphone',    icon: 'mic',                   sensitivity: 'high',   group: 'microphone' },
  FOREGROUND_SERVICE_PHONE_CALL:            { label: 'Foreground phone call',    icon: 'call',                  sensitivity: 'medium', group: 'call' },
  FOREGROUND_SERVICE_REMOTE_MESSAGING:      { label: 'Foreground messaging',     icon: 'sms',                   sensitivity: 'medium', group: 'sms' },
  FOREGROUND_SERVICE_SPECIAL_USE:           { label: 'Foreground (special use)', icon: 'memory',                sensitivity: 'medium', group: 'foreground_service' },
  FOREGROUND_SERVICE_SYSTEM_EXEMPTED:       { label: 'Foreground (system-exempt)', icon: 'memory',              sensitivity: 'medium', group: 'foreground_service' },
  GET_ACCOUNTS:                             { label: 'Accounts',                 icon: 'manage_accounts',       sensitivity: 'medium', group: 'accounts' },
  GET_PACKAGE_SIZE:                         { label: 'Package size',             icon: 'storage',               sensitivity: 'low',    group: 'storage' },
  HIGH_SAMPLING_RATE_SENSORS:               { label: 'High-rate sensors',        icon: 'sensors',               sensitivity: 'medium', group: 'sensors' },
  INSTALL_SHORTCUT:                         { label: 'Create shortcuts',         icon: 'shortcut',              sensitivity: 'low',    group: 'shortcut' },
  INTERNET:                                 { label: 'Internet',                 icon: 'public',                sensitivity: 'low',    group: 'internet' },
  KILL_BACKGROUND_PROCESSES:                { label: 'Kill background apps',     icon: 'memory',                sensitivity: 'medium', group: 'system_processes' },
  MANAGE_ACCOUNTS:                          { label: 'Manage accounts',          icon: 'manage_accounts',       sensitivity: 'high',   group: 'accounts' },
  MANAGE_DOCUMENTS:                         { label: 'Manage documents',         icon: 'description',           sensitivity: 'medium', group: 'storage' },
  MANAGE_EXTERNAL_STORAGE:                  { label: 'All-files access',         icon: 'storage',               sensitivity: 'high',   group: 'storage' },
  MANAGE_MEDIA:                             { label: 'Manage media',             icon: 'photo_library',         sensitivity: 'medium', group: 'photos_read' },
  MANAGE_OWN_CALLS:                         { label: 'Manage own calls',         icon: 'call',                  sensitivity: 'medium', group: 'call' },
  MEDIA_CONTENT_CONTROL:                    { label: 'Media content control',    icon: 'music_note',            sensitivity: 'medium', group: 'media_playback' },
  MODIFY_AUDIO_SETTINGS:                    { label: 'Audio settings',           icon: 'tune',                  sensitivity: 'low',    group: 'audio_settings' },
  NEARBY_WIFI_DEVICES:                      { label: 'Nearby Wi-Fi devices',     icon: 'phonelink_ring',        sensitivity: 'medium', group: 'nearby_devices' },
  NFC:                                      { label: 'NFC',                      icon: 'contactless',           sensitivity: 'medium', group: 'nfc' },
  NFC_PREFERRED_PAYMENT_INFO:               { label: 'NFC payment info',         icon: 'contactless',           sensitivity: 'medium', group: 'nfc' },
  NFC_TRANSACTION_EVENT:                    { label: 'NFC transactions',         icon: 'contactless',           sensitivity: 'medium', group: 'nfc' },
  PACKAGE_USAGE_STATS:                      { label: 'App usage stats',          icon: 'visibility',            sensitivity: 'high',   group: 'usage_stats' },
  POST_NOTIFICATIONS:                       { label: 'Notifications',            icon: 'notifications',         sensitivity: 'low',    group: 'notifications' },
  PROCESS_OUTGOING_CALLS:                   { label: 'Process outgoing calls',   icon: 'call_log',              sensitivity: 'high',   group: 'call_log' },
  QUERY_ALL_PACKAGES:                       { label: 'Query installed apps',     icon: 'apps',                  sensitivity: 'medium', group: 'apps' },
  READ_APP_BADGE:                           { label: 'Read app badges',          icon: 'badge',                 sensitivity: 'low',    group: 'badges' },
  READ_BASIC_PHONE_STATE:                   { label: 'Basic phone state',        icon: 'smartphone',            sensitivity: 'medium', group: 'phone_state' },
  READ_CALENDAR:                            { label: 'Read calendar',            icon: 'calendar_month',        sensitivity: 'high',   group: 'calendar' },
  READ_CALL_LOG:                            { label: 'Read call log',            icon: 'call_log',              sensitivity: 'high',   group: 'call_log' },
  READ_CONTACTS:                            { label: 'Read contacts',            icon: 'contacts',              sensitivity: 'high',   group: 'contacts' },
  READ_EXTERNAL_STORAGE:                    { label: 'Read storage',             icon: 'storage',               sensitivity: 'medium', group: 'storage' },
  READ_MEDIA_AUDIO:                         { label: 'Read audio',               icon: 'music_note',            sensitivity: 'medium', group: 'audio_files' },
  READ_MEDIA_IMAGES:                        { label: 'Read images',              icon: 'photo_library',         sensitivity: 'medium', group: 'photos_read' },
  READ_MEDIA_VIDEO:                         { label: 'Read video',               icon: 'photo_library',         sensitivity: 'medium', group: 'photos_read' },
  READ_MEDIA_VISUAL_USER_SELECTED:          { label: 'Selected media',           icon: 'photo_library',         sensitivity: 'medium', group: 'photos_read' },
  READ_PHONE_NUMBERS:                       { label: 'Phone number',             icon: 'smartphone',            sensitivity: 'medium', group: 'phone_state' },
  READ_PHONE_STATE:                         { label: 'Phone state',              icon: 'smartphone',            sensitivity: 'medium', group: 'phone_state' },
  READ_PROFILE:                             { label: 'Read profile',             icon: 'account_circle',        sensitivity: 'high',   group: 'profile' },
  READ_SMS:                                 { label: 'Read SMS',                 icon: 'sms',                   sensitivity: 'high',   group: 'sms' },
  READ_SYNC_SETTINGS:                       { label: 'Read sync settings',       icon: 'manage_accounts',       sensitivity: 'low',    group: 'accounts' },
  READ_SYNC_STATS:                          { label: 'Read sync stats',          icon: 'manage_accounts',       sensitivity: 'low',    group: 'accounts' },
  READ_VOICEMAIL:                           { label: 'Read voicemail',           icon: 'voicemail',             sensitivity: 'high',   group: 'voicemail' },
  RECEIVE_BOOT_COMPLETED:                   { label: 'Run at startup',           icon: 'power_settings_new',    sensitivity: 'medium', group: 'boot' },
  RECEIVE_MMS:                              { label: 'Receive MMS',              icon: 'sms',                   sensitivity: 'high',   group: 'sms' },
  RECEIVE_SMS:                              { label: 'Receive SMS',              icon: 'sms',                   sensitivity: 'high',   group: 'sms' },
  RECEIVE_WAP_PUSH:                         { label: 'Receive WAP push',         icon: 'sms',                   sensitivity: 'medium', group: 'sms' },
  RECORD_AUDIO:                             { label: 'Microphone',               icon: 'mic',                   sensitivity: 'high',   group: 'microphone' },
  REORDER_TASKS:                            { label: 'Reorder tasks',            icon: 'apps',                  sensitivity: 'low',    group: 'apps' },
  REQUEST_DELETE_PACKAGES:                  { label: 'Request app removal',      icon: 'apps',                  sensitivity: 'medium', group: 'apps' },
  REQUEST_INSTALL_PACKAGES:                 { label: 'Install apps',             icon: 'install_mobile',        sensitivity: 'high',   group: 'apps' },
  REQUEST_PASSWORD_COMPLEXITY:              { label: 'Password requirements',    icon: 'key',                   sensitivity: 'medium', group: 'security' },
  SCHEDULE_EXACT_ALARM:                     { label: 'Exact alarms',             icon: 'alarm',                 sensitivity: 'low',    group: 'alarm' },
  SEND_SMS:                                 { label: 'Send SMS',                 icon: 'sms',                   sensitivity: 'high',   group: 'sms' },
  SET_ALARM:                                { label: 'Set alarm',                icon: 'alarm',                 sensitivity: 'low',    group: 'alarm' },
  SET_TIME_ZONE:                            { label: 'Set time zone',            icon: 'schedule',              sensitivity: 'medium', group: 'time' },
  SET_WALLPAPER:                            { label: 'Set wallpaper',            icon: 'settings',              sensitivity: 'low',    group: 'wallpaper' },
  SYSTEM_ALERT_WINDOW:                      { label: 'Display over apps',        icon: 'flip_to_front',         sensitivity: 'high',   group: 'overlay' },
  TRANSMIT_IR:                              { label: 'Use infrared',             icon: 'cell_tower',            sensitivity: 'low',    group: 'ir' },
  USE_BIOMETRIC:                            { label: 'Biometrics',               icon: 'face',                  sensitivity: 'high',   group: 'biometric' },
  USE_EXACT_ALARM:                          { label: 'Exact alarm',              icon: 'alarm',                 sensitivity: 'low',    group: 'alarm' },
  USE_FINGERPRINT:                          { label: 'Fingerprint',              icon: 'fingerprint',           sensitivity: 'high',   group: 'biometric' },
  USE_FULL_SCREEN_INTENT:                   { label: 'Full-screen alerts',       icon: 'flip_to_front',         sensitivity: 'medium', group: 'overlay' },
  UWB_RANGING:                              { label: 'UWB ranging',              icon: 'phonelink_ring',        sensitivity: 'medium', group: 'nearby_devices' },
  VIBRATE:                                  { label: 'Vibration',                icon: 'vibration',             sensitivity: 'low',    group: 'vibration' },
  WAKE_LOCK:                                { label: 'Stay awake',               icon: 'bedtime',               sensitivity: 'low',    group: 'wake_lock' },
  WRITE_CALENDAR:                           { label: 'Write calendar',           icon: 'calendar_month',        sensitivity: 'high',   group: 'calendar' },
  WRITE_CALL_LOG:                           { label: 'Write call log',           icon: 'call_log',              sensitivity: 'high',   group: 'call_log' },
  WRITE_CONTACTS:                           { label: 'Write contacts',           icon: 'contacts',              sensitivity: 'high',   group: 'contacts' },
  WRITE_EXTERNAL_STORAGE:                   { label: 'Write storage',            icon: 'storage',               sensitivity: 'high',   group: 'storage' },
  WRITE_PROFILE:                            { label: 'Write profile',            icon: 'account_circle',        sensitivity: 'high',   group: 'profile' },
  WRITE_SETTINGS:                           { label: 'Modify settings',          icon: 'settings',              sensitivity: 'medium', group: 'settings' },
  WRITE_SMS:                                { label: 'Modify SMS',               icon: 'sms',                   sensitivity: 'high',   group: 'sms' },
  WRITE_SYNC_SETTINGS:                      { label: 'Modify sync settings',     icon: 'manage_accounts',       sensitivity: 'medium', group: 'accounts' },
  WRITE_VOICEMAIL:                          { label: 'Modify voicemail',         icon: 'voicemail',             sensitivity: 'high',   group: 'voicemail' },
};

const FALLBACK_META: PermissionMeta = {
  label: '',
  icon: 'shield',
  sensitivity: 'low',
  group: 'unknown',
};

// android.permission.X → X
function androidShortKey(key: string): string {
  const dot = key.lastIndexOf('.');
  return dot === -1 ? key : key.slice(dot + 1);
}

function humanizeUnknown(key: string): string {
  const short = androidShortKey(key)
    .replace(/UsageDescription$/, '')
    .replace(/^NS/, '');
  return short
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
}

export function metaForPermission(
  key: string,
  platform: 'ios' | 'android',
): PermissionMeta {
  if (platform === 'ios') {
    return IOS_PERMISSIONS[key] ?? { ...FALLBACK_META, label: humanizeUnknown(key) };
  }
  return ANDROID_PERMISSIONS[androidShortKey(key)] ?? {
    ...FALLBACK_META,
    label: humanizeUnknown(key),
  };
}

export function describePermission(
  key: string,
  platform: 'ios' | 'android',
  description?: string,
): PermissionView & { iconName: string } {
  const meta = metaForPermission(key, platform);
  return {
    key,
    label: meta.label,
    description,
    sensitivity: meta.sensitivity,
    icon: meta.icon, // legacy emoji slot, retained for compat — see iconName.
    iconName: meta.icon,
  };
}

const SENSITIVITY_ORDER: Record<PermissionView['sensitivity'], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function sortPermissions<T extends PermissionView>(perms: T[]): T[] {
  return [...perms].sort((a, b) => {
    const s = SENSITIVITY_ORDER[a.sensitivity] - SENSITIVITY_ORDER[b.sensitivity];
    if (s !== 0) return s;
    return a.label.localeCompare(b.label);
  });
}

/**
 * Vendor-specific Android launcher / badge permissions and pure plumbing
 * (INTERNET, ACCESS_NETWORK_STATE, …) get filtered out of the user-facing
 * landing page; they remain in the SBOM/manifest for diligence.
 */
const ANDROID_HIDE = new Set([
  'android.permission.INTERNET',
  'android.permission.ACCESS_NETWORK_STATE',
  'android.permission.ACCESS_WIFI_STATE',
  'android.permission.WAKE_LOCK',
  'android.permission.VIBRATE',
]);

export function shouldHideAndroidPermission(key: string): boolean {
  if (ANDROID_HIDE.has(key)) return true;
  if (
    key.startsWith('com.') &&
    (key.includes('.launcher.') ||
      key.includes('.badge') ||
      key.includes('home.permission'))
  ) {
    return true;
  }
  return false;
}
