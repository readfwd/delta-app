package org.apache.cordova.xapkreader;

import com.google.android.vending.expansion.downloader.impl.DownloaderService;

/**
 * This class demonstrates the minimal client implementation of the
 * DownloaderService from the Downloader library.
 */
public class XAPKDownloaderService extends DownloaderService {

    // stuff for LVL -- MODIFY FOR YOUR APPLICATION!
    private static final String BASE64_PUBLIC_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAg0SyxHnRqddo7qZ1RsB77tTGe0vsJZIheG8LRoVQtU/W211znfly/LJndALFXvhkUx9rpaiN0mo0HWixuvoKYT0tAzwOugjbPJu8y00hB4pA/XzaIV2Bb1BUUi4bBU8iUw+ivkcGx7i9447fPBDffuvgYGrnnEV2ah9wQWUp6frB/TVcM8iDuosMTmYo7uu+93VVpX2ylyqhoVw+6EzfwNfv2dXtKBgyi1ZdRmzqcYlHzj/SgYe/1f48MtyMaPFX3QXIqxTPvXTc7p68T2/3Yh4PVqhLzMo0fQj37ReXO/0blNwaxWg9A/bitxAl1s9Rrn1bm4t0K9PsR6UAvZEufwIDAQAB";

    // used by the preference obfuscater
    private static final byte[] SALT = new byte[] {
        1, 43, -12, -1, 54, 98, -100, -12, 43, 2, -8, -4, 9, 5, -106, -108, -33, 45, -1, 84
    };

    /**
     * This public key comes from your Android Market publisher account, and it
     * used by the LVL to validate responses from Market on your behalf.
     */
    @Override
    public String getPublicKey() {
        return BASE64_PUBLIC_KEY;
    }

    /**
     * This is used by the preference obfuscater to make sure that your
     * obfuscated preferences are different than the ones used by other
     * applications.
     */
    @Override
    public byte[] getSALT() {
        return SALT;
    }

    /**
     * Fill this in with the class name for your alarm receiver. We do this
     * because receivers must be unique across all of Android (it's a good idea
     * to make sure that your receiver is in your unique package)
     */
    @Override
    public String getAlarmReceiverClassName() {
        return XAPKAlarmReceiver.class.getName();
    }

}
