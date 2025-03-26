#ifdef GL_ES
precision mediump float;
#endif

uniform vec2        u_resolution;
uniform vec2        u_mouse;
uniform float       u_time;

varying vec2       v_texcoord;

#define PLATFORM_WEBGL

#define RESOLUTION              u_resolution
#define LIGHT_DIRECTION		    vec3(0., 1., 1.)
#include "lygia/lighting/atmosphere.glsl"
#define ENVMAP_FNC(N, R, M)     atmosphere(normalize(N), normalize(LIGHT_DIRECTION))

#define RAYMARCH_AOV            0
// #define RAYMARCH_MULTISAMPLE    4
#define RAYMARCH_AMBIENT        vec3(0.7, 0.9, 1.0)
#define RAYMARCH_BACKGROUND     (RAYMARCH_AMBIENT + rayDirection.y * 0.8)
// #define RAYMARCH_BACKGROUND     envMap(rayDirection, 0.0, 0.0).rgb
#define RAYMARCH_SHADING_FNC    pbr


#include "lygia/space/ratio.glsl"
#include "lygia/color/palette/heatmap.glsl"
#include "lygia/sdf.glsl"
#include "lygia/lighting/envMap.glsl"
#include "lygia/lighting/raymarch/softShadow.glsl"
#include "lygia/lighting/pbr.glsl"
#include "lygia/lighting/raymarch.glsl"
#include "lygia/color/space/linear2gamma.glsl"

float checkBoard(vec2 uv, vec2 _scale) {
    uv = floor(fract(uv * _scale) * 2.0);
    return min(1.0, uv.x + uv.y) - (uv.x * uv.y);
}

Material raymarchMap( in vec3 pos ) {
    float check = 0.5 + checkBoard(pos.xz, vec2(1.0, 1.0)) * 0.5;
    Material res = materialNew(vec3(check), 0.0, 0.5, planeSDF(pos));

    res = opUnion( res, materialNew( vec3(1.0, 1.0, 1.0), 1.0, 0.0, sphereSDF(   pos-vec3( 0.0, 0.60, 0.0), 0.5 ) ) );
    res = opUnion( res, materialNew( vec3(0.0, 1.0, 1.0), boxSDF(      pos-vec3( 2.0, 0.5, 0.0), vec3(0.4, 0.4, 0.4) ) ) );
    res = opUnion( res, materialNew( vec3(0.3, 0.3, 1.0), torusSDF(    pos-vec3( 0.0, 0.5, 2.0), vec2(0.4,0.1) ) ) );
    res = opUnion( res, materialNew( vec3(0.3, 0.1, 0.3), capsuleSDF(  pos,vec3(-2.3, 0.4,-0.2), vec3(-1.6,0.75,0.2), 0.2 ) ) );
    res = opUnion( res, materialNew( vec3(0.5, 0.3, 0.4), triPrismSDF( pos-vec3(-2.0, 0.50,-2.0), vec2(0.5,0.1) ) ) );
    res = opUnion( res, materialNew( vec3(0.2, 0.2, 0.8), cylinderSDF( pos-vec3( 2.0, 0.50,-2.0), vec2(0.2,0.4) ) ) );
    res = opUnion( res, materialNew( vec3(0.7, 0.5, 0.2), coneSDF(     pos-vec3( 0.0, 0.75,-2.0), vec3(0.8,0.6,0.6) ) ) );
    res = opUnion( res, materialNew( vec3(0.4, 0.2, 0.9), hexPrismSDF( pos-vec3(-2.0, 0.60, 2.0), vec2(0.5,0.1) ) ) );
    res = opUnion( res, materialNew( vec3(0.1, 0.3, 0.6), pyramidSDF(  pos-vec3( 2.0, 0.10, 2.0), 1.0 ) ) );;

    return res;
}

void main(void) {
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
    vec2 pixel = 1.0/u_resolution;
    vec2 st = v_texcoord;
    vec2 uv = ratio(st, u_resolution);

    vec2 mo = u_mouse * pixel;
    float time = 32.0 + u_time * 1.5;
    vec3 cam = vec3( 4.5*cos(0.1*time - 7.0*mo.x), 2.2, 4.5*sin(0.1*time - 7.0*mo.x) );

    #if RAYMARCH_AOV == 0
    // Don't return anything
    color.rgb = linear2gamma( raymarch(cam, vec3(0.0), uv).rgb );

    #elif RAYMARCH_AOV == 1
    // Return depth
    float depth = 0.0;
    color.rgb = linear2gamma( raymarch(cam, vec3(0.0), uv, depth).rgb );
    vec3 depth_heat = heatmap( depth/(length(cam) * 2.0) );
    color.rgb = mix(color.rgb, depth_heat, step(0.5, st.x) );

    #elif RAYMARCH_AOV == 2
    // Return material
    Material mat;
    float depth = 0.0;
    color.rgb = linear2gamma( raymarch(cam, vec3(0.0), uv, depth, mat).rgb );
    vec3 depth_heat = heatmap( depth/(length(cam) * 2.0) );
    vec3 normal = mat.normal * 0.5 + 0.5;
    color.rgb = mix(mix(color.rgb, depth_heat, step(0.5, st.y)),
                    mix(mat.albedo.rgb, normal, step(0.5, st.y)),
                    step(0.5, st.x) );

    // color.rgb = vec3(mat.roughness);
    // color.rgb = vec3(mat.metallic);
    // color.rgb = mat.emissive;
    // color.rgb = vec3(mat.ambientOcclusion);
    #endif

    gl_FragColor = color;
}

