package com.example.hellotroll;

import android.os.Bundle;
import android.app.Activity;
import android.content.Intent;
import android.util.Log;
import android.view.Menu;
import android.widget.Toast;

public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.v("onCreate()", "onCreate()");
        setContentView(R.layout.activity_main);
        Toast.makeText(getApplicationContext(), "Hello World !", Toast.LENGTH_SHORT).show();
    }
    
    @Override
    protected void onPause() {
    	super.onPause();
    	Log.v("onPause()", "onPause()");
    };
    
    @Override
    protected void onStop() {
    	super.onStop();
    	Log.v("onStop()", "onStop()");
    };
    
    @Override
    protected void onResume() {
    	super.onResume();
    	Log.v("onResume()", "onResume()");
    };
    
    @Override
    protected void onRestart() {
    	super.onRestart();
    	Log.v("onRestart()", "onRestart()");
    };
    
    @Override
    protected void onStart() {
    	super.onStart();
    	Log.v("onStart()", "onStart()");
    	startService(new Intent(this, TrollService.class));
    };
    
    @Override
    protected void onDestroy() {
    	super.onDestroy();
    	Log.v("onDestroy()", "onDestroy()");
    };

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.activity_main, menu);
        return true;
    }
    
}
