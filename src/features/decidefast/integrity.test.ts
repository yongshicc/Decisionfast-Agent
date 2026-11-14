import { describe, it, expect, vi, afterEach } from 'vitest';
import { benchmarks, validation } from './data';
import { analyzeComplaint, safeReviewUrl, fetchReviews } from './api';
describe('Recorded validation rules',()=>{
 it('retains the exact benchmark values for the same validation set',()=>{ expect(validation.records).toBe(1000);expect(validation.positives).toBe(98);expect(benchmarks.map(b=>[b.original,b.tuned])).toEqual([[.8310,.8960],[.3563,.4824],[.8980,.8367],[.5101,.6119],[.5006,.6521],[.9164,.9318],[.1566,.0879],[.2977,.0905],[206.1,237.1],[528,601.3]]); });
 it('retains fixed selective automation observations',()=>{expect(validation).toMatchObject({autoNoMax:.01,autoYesMin:.99,coverage:74.4,review:25.6,error:1.34,falseNegatives:7,falsePositives:3});});
});
describe('Real API only',()=>{
 afterEach(()=>vi.unstubAllGlobals());
 it('forwards complaint without inventing a result',async()=>{const fetch=vi.fn().mockResolvedValue(new Response(JSON.stringify({decision:'AUTO_NO',probability:.003}),{status:200}));vi.stubGlobal('fetch',fetch);const r=await analyzeComplaint('CHECK-001','Reported symptom');expect(r.probability).toBe(.003);expect(JSON.parse(fetch.mock.calls[0]?.[1].body)).toEqual({complaint_id:'CHECK-001',complaint:'Reported symptom'});});
 it('preserves 202 real review responses',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({decision:'HUMAN_REVIEW',probability:.5,review_status:'PENDING_HUMAN_REVIEW'}),{status:202})));expect((await analyzeComplaint('CHECK-002','Review me')).decision).toBe('HUMAN_REVIEW');});
 it.each([400,502,503,504])('surfaces HTTP %s and the actual error',async(status)=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({error:'Upstream actual error'}),{status})));await expect(analyzeComplaint('CHECK-003','Symptom')).rejects.toMatchObject({status,message:'{"error":"Upstream actual error"}'});});
 it('rejects invalid predictions',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({decision:'AUTO_YES',probability:2}))));await expect(analyzeComplaint('CHECK','Symptom')).rejects.toMatchObject({status:502});});
 it('keeps empty history empty',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({returned:0,total_matching:0,rows:[]}))));expect((await fetchReviews()).rows).toEqual([]);});
 it('never creates or opens external review URLs',()=>{expect(safeReviewUrl()).toBeUndefined();expect(safeReviewUrl('https://external.test/review')).toBeUndefined();expect(safeReviewUrl('javascript:alert(1)')).toBeUndefined();expect(safeReviewUrl('http://127.0.0.1:5678/form/real-id')).toBe('http://127.0.0.1:5678/form/real-id');});
});
