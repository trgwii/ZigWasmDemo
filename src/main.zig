const std = @import("std");

extern fn print([*:0]const u8) void;
extern fn alloc(bytes: u32) [*]u8;

fn printNumber(x: u32) void {
    var buf: [1024:0]u8 = undefined;
    _ = std.fmt.bufPrint(&buf, "{}\x00", .{x}) catch print("ERROR");
    print(buf[0.. :0]);
}

export fn allocScreen(width: u32, height: u32) ?[*]u32 {
    return (std.heap.page_allocator.alloc(u32, width * height) catch return null).ptr;
}

export fn freeScreen(screen: [*]u32) void {
    std.heap.page_allocator.free(@ptrCast(*[1]u32, screen));
}

export fn render(mem: [*]u32, width: u32, height: u32) void {
    var y: u32 = 0;
    var x: u32 = 0;
    while (y < height) : (y += 1) {
        while (x < width) : (x += 1) {
            mem[y * height + x] = 0xFF0000FF;
        }
    }
}
