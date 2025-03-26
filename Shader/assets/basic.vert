#ifdef GL_ES
precision mediump float;
#endif

attribute vec3 aPosition;

varying vec2   v_texcoord;

void main() {
    v_texcoord = aPosition.xy;
    gl_Position = vec4(aPosition * 2.0 - 1.0, 1.0);
}