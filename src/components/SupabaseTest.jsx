import React, { useState } from 'react';
import supabaseClient from '../lib/supabase';

function SupabaseTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const runTest = async () => {
    setIsLoading(true);
    setLastResult(null);
    
    console.log('🧪 Testing Supabase connectivity...');
    console.log('Supabase URL:', supabaseClient.supabaseUrl);
    console.log('Supabase Key:', supabaseClient.supabaseKey ? 'Present' : 'Missing');
    
    try {
      // Test 1: Basic connection
      console.log('📡 Testing basic connection...');
      
      // Test 2: Query users table
      console.log('👥 Querying users_pt2024 table...');
      const { data: users, error } = await supabaseClient
        .from('users_pt2024')
        .select('*');
      
      if (error) {
        console.error('❌ Supabase Error:', error);
        console.error('Error Details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setLastResult({ success: false, error: error.message });
      } else {
        console.log('✅ Supabase Test Successful!');
        console.log('📊 Users found:', users?.length || 0);
        console.log('👤 Users data:', users);
        setLastResult({ success: true, count: users?.length || 0, users });
      }
      
      // Test 3: Check table structure
      console.log('🔍 Testing table structure...');
      const { data: tableInfo, error: tableError } = await supabaseClient
        .from('users_pt2024')
        .select('id, email, role')
        .limit(1);
        
      if (tableError) {
        console.error('⚠️ Table structure error:', tableError);
      } else {
        console.log('📋 Table structure test passed:', tableInfo);
      }
      
    } catch (error) {
      console.error('💥 Unexpected error:', error);
      setLastResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <div className="mb-3">
        <h3 className="text-lg font-bold text-blue-700">🧪 Supabase Test</h3>
        <p className="text-sm text-gray-600">Check browser console for details</p>
      </div>
      
      <button
        onClick={runTest}
        disabled={isLoading}
        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
          isLoading 
            ? 'bg-gray-400 text-white cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isLoading ? (
          <>
            <span className="animate-spin inline-block mr-2">⚪</span>
            Testing...
          </>
        ) : (
          'Run Test'
        )}
      </button>
      
      {lastResult && (
        <div className={`mt-3 p-2 rounded text-sm ${
          lastResult.success 
            ? 'bg-green-100 text-green-800 border border-green-300'
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {lastResult.success ? (
            <>
              ✅ Success! Found {lastResult.count} users
            </>
          ) : (
            <>
              ❌ Error: {lastResult.error}
            </>
          )}
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        <div>URL: {supabaseClient.supabaseUrl ? '✅' : '❌'}</div>
        <div>Key: {supabaseClient.supabaseKey ? '✅' : '❌'}</div>
      </div>
    </div>
  );
}

export default SupabaseTest;