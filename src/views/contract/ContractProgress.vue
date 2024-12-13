<template>
    <div class="flex flex-column flex-row gap-5" style="padding: 20px 70px;">
        <ScrollPanel
            style="width: 50%; height: 700px; border: 1px solid #e0e0e0; padding: 30px 0 30px 30px; border-radius: 25px;"
            :pt="{
                wrapper: {
                    style: { 'border-right': '10px solid #6360AB' }
                },
                bary: 'hover:bg-primary-400 bg-primary-300 opacity-100'
            }">
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo
                consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                deserunt mollit anim id est laborum.
            </p>
            <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
                laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto
                beatae vitae dicta sunt explicabo. Nemo enim
                ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni
                dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non
                numquam eius modi.
            </p>
            <p>
                At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum
                deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non
                provident, similique sunt in culpa
                qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum
                facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio
                cumque nihil impedit quo minus.
            </p>
        </ScrollPanel>
        <ScrollPanel
            style="width: 50%; height: 700px; border: 1px solid #e0e0e0; padding: 30px 0 30px 30px; border-radius: 25px;"
            :pt="{
                wrapper: { style: { 'border-right': '10px solid #6360AB' } },
                bary: 'hover:surface-300 opacity-100 border-noround'
            }">
            <Timeline :value="events">
                <template #opposite="slotProps">
                    <small class="p-text-secondary">{{ slotProps.item.date }}</small>
                </template>
                <template #content="slotProps">
                    {{ slotProps.item.status }}
                </template>
            </Timeline>

        </ScrollPanel>
    </div>
</template>

<script setup>
import { ref } from "vue";

const events = ref([
    { status: 'Ordered', date: '15/10/2020 10:30', icon: 'pi pi-shopping-cart', color: '#9C27B0' },
    { status: 'Processing', date: '15/10/2020 14:00', icon: 'pi pi-cog', color: '#673AB7' },
    { status: 'Shipped', date: '15/10/2020 16:15', icon: 'pi pi-shopping-cart', color: '#FF9800' },
    { status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' }
]);
</script>

<style scoped>
.p-scrollpanel .p-component {
    width: 100%;
    height: 200px;
    border: 1px solid rgb(224, 224, 224);
    border-radius: 25px !important;
    padding: 30px 30px 30px 0 !important;
}
</style>