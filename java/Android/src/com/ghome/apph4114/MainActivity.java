package com.ghome.apph4114;

import com.ghome.apph4114.R;

import android.os.Bundle;
import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;
import android.view.Menu;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

public class MainActivity extends Activity {
	private static boolean DBG = false;
	protected void TTextShow(String text) {
		if(!DBG) {
			return;
		}
		Toast.makeText(getApplicationContext(), text, Toast.LENGTH_SHORT)
				.show();
	}
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        log("onCreate()", "onCreate()");
        setContentView(R.layout.activity_main);
        TTextShow("Hello World");
    }
    
    protected void log(String a, String b) {
		if(!DBG) {
			return;
		}
		log(a, b);
	}
    
    @Override
    protected void onPause() {
    	super.onPause();
    	log("onPause()", "onPause()");
    };
    
    @Override
    protected void onStop() {
    	super.onStop();
    	log("onStop()", "onStop()");
    };
    
    @Override
    protected void onResume() {
    	super.onResume();
    	log("onResume()", "onResume()");
    };
    
    @Override
    protected void onRestart() {
    	super.onRestart();
    	log("onRestart()", "onRestart()");
    };
    
    @Override
    protected void onStart() {
    	super.onStart();
    	log("onStart()", "onStart()");
    	startService(new Intent(this, TrollService.class));
    };
    
    @Override
    protected void onDestroy() {
    	super.onDestroy();
    	log("onDestroy()", "onDestroy()");
    };

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.activity_main, menu);
        return true;
    }
    
    public void setPreferences(View view) {
    	EditText ipET = (EditText) findViewById(R.id.IPAddressField);
    	EditText loginET = (EditText) findViewById(R.id.login);
    	EditText pwdET = (EditText) findViewById(R.id.password);
    	String ip= ipET.getText().toString();
    	String login = loginET.getText().toString();
    	String pwd = pwdET.getText().toString();
    	
    	 SharedPreferences settings = getSharedPreferences(TrollService.PREFS_NAME, 0);
         SharedPreferences.Editor editor = settings.edit();
         editor.putString("ip_address", ip);
         editor.putString("login", login);
         editor.putString("pwd", pwd);

         // Commit the edits!
         editor.commit();
    }
    
    
}
