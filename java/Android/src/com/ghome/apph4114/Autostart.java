package com.ghome.apph4114;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class Autostart extends BroadcastReceiver 
{
    public void onReceive(Context arg0, Intent arg1) 
    {
        Intent intent = new Intent(arg0, TrollService.class);
        arg0.startService(intent);
        Log.i("Autostart", "started");
    }
}