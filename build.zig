const std = @import("std");

pub fn build(b: *std.build.Builder) void {
    const lib = b.addStaticLibrary("ZigWasmDemo", "src/main.zig");
    lib.linkage = .dynamic;
    lib.setBuildMode(.ReleaseSmall);
    lib.setTarget(.{
        .cpu_arch = .wasm32,
        .os_tag = .freestanding,
    });
    lib.install();
}
